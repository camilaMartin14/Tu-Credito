using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using System.Security.Claims;
using System.Text.Json;
using TuCredito.Models;

namespace TuCredito.Interceptors
{
    public class AuditInterceptor : SaveChangesInterceptor
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public AuditInterceptor(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public override InterceptionResult<int> SavingChanges(DbContextEventData eventData, InterceptionResult<int> result)
        {
            UpdateAuditEntities(eventData.Context);
            return base.SavingChanges(eventData, result);
        }

        public override ValueTask<InterceptionResult<int>> SavingChangesAsync(DbContextEventData eventData, InterceptionResult<int> result, CancellationToken cancellationToken = default)
        {
            UpdateAuditEntities(eventData.Context);
            return base.SavingChangesAsync(eventData, result, cancellationToken);
        }

        private void UpdateAuditEntities(DbContext? context)
        {
            if (context == null) return;

            // Evitar recursión si estamos guardando AuditLogs
            if (context.ChangeTracker.Entries<AuditLog>().Any(e => e.State == EntityState.Added))
            {
                return;
            }

            var userId = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                         ?? _httpContextAccessor.HttpContext?.User?.FindFirst("id")?.Value
                         ?? "System";

            var entries = context.ChangeTracker.Entries()
                .Where(e => e.State == EntityState.Added || e.State == EntityState.Modified || e.State == EntityState.Deleted)
                .ToList();

            var auditEntries = new List<AuditLog>();

            foreach (var entry in entries)
            {
                var entityType = entry.Entity.GetType();
                
                // Filtrar solo entidades sensibles
                if (!IsSensitiveEntity(entityType)) continue;

                var auditEntry = new AuditLog
                {
                    EntityName = entityType.Name,
                    Action = entry.State.ToString(),
                    Timestamp = DateTime.UtcNow,
                    UserId = userId,
                    EntityId = GetPrimaryKey(entry)
                };

                var changes = new Dictionary<string, object>();

                if (entry.State == EntityState.Modified)
                {
                    foreach (var property in entry.OriginalValues.Properties)
                    {
                        var original = entry.OriginalValues[property];
                        var current = entry.CurrentValues[property];

                        if (!Equals(original, current))
                        {
                            changes[property.Name] = new { Original = original, Current = current };
                        }
                    }
                }
                else if (entry.State == EntityState.Added)
                {
                    foreach (var property in entry.CurrentValues.Properties)
                    {
                        changes[property.Name] = entry.CurrentValues[property];
                    }
                }
                else if (entry.State == EntityState.Deleted)
                {
                    foreach (var property in entry.OriginalValues.Properties)
                    {
                        changes[property.Name] = entry.OriginalValues[property];
                    }
                }

                auditEntry.Changes = JsonSerializer.Serialize(changes);
                auditEntries.Add(auditEntry);
            }

            if (auditEntries.Any())
            {
                context.Set<AuditLog>().AddRange(auditEntries);
            }
        }

        private bool IsSensitiveEntity(Type type)
        {
            var name = type.Name;
            // "Clientes"  es la entidad Prestatario
            return name == "Prestamo" || name == "Pago" || name == "Prestatario" || name == "Garante";
        }

        private string GetPrimaryKey(Microsoft.EntityFrameworkCore.ChangeTracking.EntityEntry entry)
        {
            var keyName = entry.Metadata.FindPrimaryKey()?.Properties.Select(x => x.Name).FirstOrDefault();
            if (keyName != null)
            {
                var val = entry.State == EntityState.Deleted 
                    ? entry.OriginalValues[keyName] 
                    : entry.CurrentValues[keyName];
                
                return val?.ToString() ?? "N/A";
            }
            return "N/A";
        }
    }
}
