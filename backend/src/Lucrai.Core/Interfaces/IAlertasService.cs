using Lucrai.Core.DTOs.Dashboard;

namespace Lucrai.Core.Interfaces;

public interface IAlertasService
{
    Task<List<AlertResponse>> GetAlertsAsync(string company);
    Task DismissAlertAsync(string alertId, string company, string? userName);
    Task RestoreAlertAsync(string alertId, string company);
}
