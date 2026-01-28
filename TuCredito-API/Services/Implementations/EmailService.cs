
using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;
using TuCredito.Services.Interfaces;

namespace TuCredito.Services.Implementations
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public async Task SendEmailAsync(string to, string subject, string body)
        {
            var emailSettings = _configuration.GetSection("EmailSettings");
            var host = emailSettings["Host"];
            var port = int.Parse(emailSettings["Port"] ?? "587");
            var fromEmail = emailSettings["FromEmail"];
            var password = emailSettings["Password"];
            var enableSsl = bool.Parse(emailSettings["EnableSsl"] ?? "true");

            if (string.IsNullOrEmpty(host) || string.IsNullOrEmpty(fromEmail) || string.IsNullOrEmpty(password))
            {
                _logger.LogWarning("Email settings are not configured properly. Email to {to} with subject '{subject}' was not sent.", to, subject);
                // In a real scenario, we might want to throw or handle this differently.
                // For now, we simulate sending by logging.
                _logger.LogInformation("SIMULATION: Email sent to {to} with subject {subject}", to, subject);
                return;
            }

            try
            {
                using (var client = new SmtpClient(host, port))
                {
                    client.EnableSsl = enableSsl;
                    client.Credentials = new NetworkCredential(fromEmail, password);

                    var mailMessage = new MailMessage
                    {
                        From = new MailAddress(fromEmail),
                        Subject = subject,
                        Body = body,
                        IsBodyHtml = true
                    };
                    mailMessage.To.Add(to);

                    await client.SendMailAsync(mailMessage);
                    _logger.LogInformation("Email sent to {to} with subject {subject}", to, subject);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending email to {to}", to);
                throw;
            }
        }
    }
}
