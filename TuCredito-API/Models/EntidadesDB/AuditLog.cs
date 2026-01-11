using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TuCredito.Models
{
    public class AuditLog
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string EntityName { get; set; } = default!;

        [Required]
        [MaxLength(20)]
        public string Action { get; set; } = default!;

        public DateTime Timestamp { get; set; }

        [MaxLength(100)]
        public string? UserId { get; set; }

        public string? Changes { get; set; }

        [MaxLength(100)]
        public string? EntityId { get; set; }
    }
}
