import { Component, OnInit, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions, ChartType } from 'chart.js';
import { DashboardService } from './services/dashboard.service';
import { LayoutService } from '../layout/services/layout.service';
import {
  DashboardKpisDTO,
  GraficoDatoDTO,
  SerieTiempoDTO,
  SimulacionPrestamoEntryDTO,
  SimulacionPrestamoOutputDTO
} from './models/dashboard.models';
import { forkJoin, finalize } from 'rxjs';

import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CalculatorService } from './services/calculator.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private calculatorService = inject(CalculatorService);
  private layoutService = inject(LayoutService);
  private router = inject(Router);
  
  // State Signals
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);
  lastUpdated = signal<Date | null>(null);
  showFullDashboard = signal<boolean>(false);
  currentFilter = signal<string>('this_month');

  constructor() {
    effect(() => {
      const isDark = this.layoutService.isDarkMode();
      this.updateChartColors(isDark);
    });
  }


  // Data Signals
  kpis = signal<DashboardKpisDTO | null>(null);

  // Calculator Signals
  simAmount = signal<number | null>(null);
  simInstallments = signal<number | null>(null);
  simInterest = signal<number>(5); // Default 5%
  simResult = signal<SimulacionPrestamoOutputDTO | null>(null);
  simLoading = signal<boolean>(false);

  calculateLoan() {
    const amount = this.simAmount();
    const installments = this.simInstallments();
    const interest = this.simInterest();

    if (!amount || !installments || !interest) return;

    this.simLoading.set(true);
    const entry: SimulacionPrestamoEntryDTO = {
      montoPrestamo: amount,
      cantidadCuotas: installments,
      interesMensual: interest
    };

    this.calculatorService.simulateLoan(entry)
      .pipe(finalize(() => this.simLoading.set(false)))
      .subscribe({
        next: (res) => this.simResult.set(res),
        error: (err) => console.error(err)
      });
  }

  clearCalculator() {
    this.simAmount.set(null);
    this.simInstallments.set(null);
    this.simInterest.set(5);
    this.simResult.set(null);
  }

  navigateToLoans(status: string) {
    this.router.navigate(['/loans'], { queryParams: { status } });
  }

  navigateToRoute(route: string) {
    this.router.navigate([route]);
  }

  // Chart Styling Constants
  private colors = {
    primary: '#4318FF',
    secondary: '#6AD2FF',
    success: '#05CD99',
    warning: '#FFB547',
    danger: '#EE5D50',
    grid: '#E9EDF7',
    text: '#A3AED0',
    textMain: '#2B3674'
  };

  private readonly fontConfig = {
    family: "'DM Sans', sans-serif",
    size: 12
  };

  // Charts Data
  public flujoCobranzasData: ChartConfiguration<'line'>['data'] = { datasets: [], labels: [] };
  public evolucionSaldoData: ChartConfiguration<'line'>['data'] = { datasets: [], labels: [] };
  public prestamosEstadoData: ChartConfiguration<'doughnut'>['data'] = { datasets: [], labels: [] };
  public rankingClientesData: ChartConfiguration<'bar'>['data'] = { datasets: [], labels: [] };
  public proyeccionFlujoData: ChartConfiguration<'bar'>['data'] = { datasets: [], labels: [] };
  public evolucionColocacionData: ChartConfiguration<'line'>['data'] = { datasets: [], labels: [] };
  public composicionRiesgoData: ChartConfiguration<'doughnut'>['data'] = { datasets: [], labels: [] };

  // Charts Options
  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    elements: {
      line: { tension: 0.4 },
      point: { radius: 0, hitRadius: 10, hoverRadius: 4 }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: this.colors.text, font: this.fontConfig }
      },
      y: {
        grid: { color: this.colors.grid, tickBorderDash: [5, 5] },
        ticks: { color: this.colors.text, font: this.fontConfig },
        border: { display: false } // Remove Y axis line
      }
    },
    plugins: {
      legend: { display: false }, // Clean look, hide default legend
      tooltip: {
        backgroundColor: this.colors.textMain,
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 10,
        cornerRadius: 8,
        displayColors: false
      }
    }
  };

  public doughnutChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%', // Thicker ring
    plugins: {
      legend: {
        position: 'right',
        labels: { color: this.colors.text, font: { ...this.fontConfig, size: 12 }, usePointStyle: true, padding: 20 }
      }
    }
  };

  public barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: this.colors.text, font: this.fontConfig }
      },
      y: {
        display: false // Hide Y axis for cleaner ranking
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: this.colors.textMain,
        padding: 10,
        cornerRadius: 8
      }
    },
    elements: {
      bar: {
        borderRadius: 20, // Rounded bars
        borderSkipped: false
      }
    }
  };

  ngOnInit(): void {
    // Theme initialization is now handled by LayoutService
    this.loadDashboardData();
  }

  toggleFullDashboard(): void {
    this.showFullDashboard.update(v => !v);
  }

  private updateChartColors(isDark: boolean): void {
    if (isDark) {
      this.colors.text = '#A3AED0'; // Keep same or adjust
      this.colors.textMain = '#FFFFFF';
      this.colors.grid = 'rgba(255, 255, 255, 0.1)';
    } else {
      this.colors.text = '#A3AED0';
      this.colors.textMain = '#2B3674';
      this.colors.grid = '#E9EDF7';
    }
    
    // Update Options References to trigger change detection in charts
    this.lineChartOptions = {
      ...this.lineChartOptions,
      scales: {
        x: { 
          grid: { display: false },
          ticks: { color: this.colors.text, font: this.fontConfig }
        },
        y: {
          grid: { color: this.colors.grid, tickBorderDash: [5, 5] },
          ticks: { color: this.colors.text, font: this.fontConfig },
          border: { display: false }
        }
      },
      plugins: {
        ...this.lineChartOptions.plugins,
        tooltip: {
          ...this.lineChartOptions.plugins?.tooltip,
          backgroundColor: this.colors.textMain,
          titleColor: isDark ? '#2B3674' : '#fff', // Invert text on tooltip if background changes
          bodyColor: isDark ? '#2B3674' : '#fff',
        }
      }
    };
    
    // Also update other chart options if necessary to propagate colors
    this.doughnutChartOptions = {
      ...this.doughnutChartOptions,
      plugins: {
        ...this.doughnutChartOptions.plugins,
        legend: {
          ...this.doughnutChartOptions.plugins?.legend,
          labels: { 
            color: this.colors.text, 
            font: { ...this.fontConfig, size: 12 }, 
            usePointStyle: true, 
            padding: 20 
          }
        }
      }
    };

    this.barChartOptions = {
       ...this.barChartOptions,
       scales: {
        x: {
          grid: { display: false },
          ticks: { color: this.colors.text, font: this.fontConfig }
        },
        y: {
          display: false
        }
      },
       plugins: {
        ...this.barChartOptions.plugins,
         tooltip: {
          ...this.barChartOptions.plugins?.tooltip,
          backgroundColor: this.colors.textMain,
        }
       }
    };
  }

  loadDashboardData(): void {
    this.isLoading.set(true);
    this.error.set(null);

    const { from, to } = this.getDateRangeFromFilter(this.currentFilter());

    forkJoin({
      kpis: this.dashboardService.getKpis(from, to),
      prestamosEstado: this.dashboardService.getPrestamosPorEstado(),
      flujoCobranzas: this.dashboardService.getFlujoCobranzas(from, to),
      evolucionSaldo: this.dashboardService.getEvolucionSaldo(),
      rankingClientes: this.dashboardService.getRankingClientesDeuda(),
      proyeccionFlujo: this.dashboardService.getProyeccionFlujoCaja(),
      evolucionColocacion: this.dashboardService.getEvolucionColocacion(from, to),
      composicionRiesgo: this.dashboardService.getComposicionRiesgo()
    })
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
          this.lastUpdated.set(new Date());
        })
      )
      .subscribe({
        next: (data) => {
          this.kpis.set(data.kpis);
          this.setupFlujoCobranzasChart(data.flujoCobranzas);
          this.setupEvolucionSaldoChart(data.evolucionSaldo);
          this.setupPrestamosEstadoChart(data.prestamosEstado);
          this.setupRankingClientesChart(data.rankingClientes);
          this.setupProyeccionFlujoChart(data.proyeccionFlujo);
          this.setupEvolucionColocacionChart(data.evolucionColocacion);
          this.setupComposicionRiesgoChart(data.composicionRiesgo);
        },
        error: (err) => {
          this.error.set('No se pudieron cargar los datos del dashboard. Por favor, intente nuevamente.');
          console.error(err);
        },
      });
  }

  onFilterChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.currentFilter.set(select.value);
    this.loadDashboardData();
  }

  private getDateRangeFromFilter(filter: string): { from?: string, to?: string } {
    const now = new Date();
    let from: Date | undefined;
    let to: Date | undefined = now;

    switch (filter) {
      case 'this_month':
        from = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'last_month':
        from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        to = new Date(now.getFullYear(), now.getMonth(), 0); // Last day of prev month
        break;
      case 'last_3_months':
        from = new Date(now.getFullYear(), now.getMonth() - 2, 1);
        break;
      case 'this_year':
        from = new Date(now.getFullYear(), 0, 1);
        break;
      case 'all':
        return {}; // No params = all time (handled by backend nulls)
    }

    // Format as YYYY-MM-DD for API
    const formatDate = (d: Date) => d.toISOString().split('T')[0];
    
    return {
      from: from ? formatDate(from) : undefined,
      to: to ? formatDate(to) : undefined
    };
  }

  private setupFlujoCobranzasChart(data: SerieTiempoDTO[]): void {
    const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    
    this.flujoCobranzasData = {
      labels: data.map((d) => `${monthNames[d.mes - 1] || d.mes}`),
      datasets: [
        {
          data: data.map((d) => d.valor),
          label: 'Cobranzas',
          fill: true,
          borderColor: this.colors.primary,
          backgroundColor: (context) => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, 'rgba(67, 24, 255, 0.2)');
            gradient.addColorStop(1, 'rgba(67, 24, 255, 0)');
            return gradient;
          },
          pointBackgroundColor: '#fff',
          pointBorderColor: this.colors.primary,
          pointBorderWidth: 2
        },
      ],
    };
  }

  private setupEvolucionSaldoChart(data: SerieTiempoDTO[]): void {
    const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

    this.evolucionSaldoData = {
      labels: data.map((d) => `${monthNames[d.mes - 1] || d.mes} ${d.anio}`),
      datasets: [
        {
          data: data.map((d) => d.valor),
          label: 'Saldo',
          borderColor: this.colors.secondary,
          backgroundColor: (context) => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, 'rgba(106, 210, 255, 0.2)');
            gradient.addColorStop(1, 'rgba(106, 210, 255, 0)');
            return gradient;
          },
          fill: true,
          pointBackgroundColor: '#fff',
          pointBorderColor: this.colors.secondary,
          pointBorderWidth: 2
        },
      ],
    };
  }

  private setupPrestamosEstadoChart(data: GraficoDatoDTO[]): void {
    this.prestamosEstadoData = {
      labels: data.map((d) => d.etiqueta),
      datasets: [
        {
          data: data.map((d) => d.valor),
          backgroundColor: [
            this.colors.primary,
            this.colors.secondary,
            this.colors.success,
            this.colors.warning,
            this.colors.danger
          ],
          borderWidth: 0,
          hoverOffset: 4
        },
      ],
    };
  }

  private setupRankingClientesChart(data: GraficoDatoDTO[]): void {
    this.rankingClientesData = {
      labels: data.map((d) => d.etiqueta),
      datasets: [
        {
          data: data.map((d) => d.valor),
          label: 'Deuda',
          backgroundColor: this.colors.warning,
          barThickness: 20
        },
      ],
    };
  }

  private setupProyeccionFlujoChart(data: GraficoDatoDTO[]): void {
    this.proyeccionFlujoData = {
      labels: data.map((d) => d.etiqueta),
      datasets: [
        {
          data: data.map((d) => d.valor),
          label: 'Cobro Esperado',
          backgroundColor: this.colors.success,
          borderRadius: 4,
          barThickness: 30
        },
      ],
    };
  }

  private setupEvolucionColocacionChart(data: SerieTiempoDTO[]): void {
    const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    this.evolucionColocacionData = {
      labels: data.map((d) => `${monthNames[d.mes - 1] || d.mes} ${d.anio}`),
      datasets: [
        {
          data: data.map((d) => d.valor),
          label: 'Monto Otorgado',
          borderColor: this.colors.primary,
          backgroundColor: (context: any) => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, 'rgba(67, 24, 255, 0.2)');
            gradient.addColorStop(1, 'rgba(67, 24, 255, 0)');
            return gradient;
          },
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#fff',
          pointBorderColor: this.colors.primary,
          pointBorderWidth: 2
        },
      ],
    };
  }

  private setupComposicionRiesgoChart(data: GraficoDatoDTO[]): void {
    this.composicionRiesgoData = {
      labels: data.map((d) => d.etiqueta),
      datasets: [
        {
          data: data.map((d) => d.valor),
          backgroundColor: [
            this.colors.success, // 1-30 days - low risk
            this.colors.warning, // 31-60 days - medium risk
            '#FF8F6B',           // 61-90 days - high risk
            this.colors.danger   // >90 days - very high risk
          ],
          borderWidth: 0,
          hoverOffset: 4
        },
      ],
    };
  }
}
