namespace TuCredito.DTOs.Dashboard;

public class TransactionDTO
{
    public string Type { get; set; } = string.Empty; // "Prestamo" or "Pago"
    public DateTime Date { get; set; }
    public decimal Amount { get; set; }
    public string EntityName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
}
