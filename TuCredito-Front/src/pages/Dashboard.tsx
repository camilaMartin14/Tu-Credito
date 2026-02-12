import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { DollarSign, AlertTriangle, TrendingUp, Users, Plus, UserPlus, FileText, ArrowRight } from 'lucide-react';
import { KPIWidget } from '../components/dashboard/KPIWidget';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme';
import { calculateDaysToMaturity, formatCurrency, formatDate } from '../utils/formatters';
import { StatusBadge } from '../components/ui/StatusBadge';
import { InfoTooltip } from '../components/ui/InfoTooltip';
import {
  getDashboardKpis,
  getLoansTrend,
  getLoansByStatus,
  getMonthlyCollections,
  getUpcomingInstallments,
  getRecentTransactions,
  getCashFlowProjection
} from '../services/dashboardService';
import { Link } from 'react-router-dom';

// Custom Colors for the theme
const COLORS = ['#A855F7', '#10B981', '#F472B6', '#FBBF24'];
const THEME_COLORS = {
    grid: '#2A3241',
    text: '#9CA3AF',
    tooltipBg: '#151A23',
    tooltipBorder: '#2A3241'
};

const ChartEmptyState = ({ message }: { message: string }) => (
    <div className="h-full w-full flex flex-col items-center justify-center text-muted min-h-[200px]">
        <div className="p-3 rounded-full bg-surfaceHighlight mb-3">
            <TrendingUp className="h-6 w-6 text-gray-400 opacity-50" />
        </div>
        <p className="text-sm font-medium">{message}</p>
    </div>
);

export function Dashboard() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { data: kpis, isLoading: isLoadingKpis } = useQuery({ queryKey: ['dashboardKpis'], queryFn: getDashboardKpis });

  const axisColor = theme === 'dark' ? '#9CA3AF' : '#6B7280';

  const { data: loansTrend } = useQuery({ queryKey: ['loansTrend'], queryFn: getLoansTrend });
  const { data: loansByStatus } = useQuery({ queryKey: ['loansByStatus'], queryFn: getLoansByStatus });
  const { data: monthlyCollections } = useQuery({ queryKey: ['monthlyCollections'], queryFn: getMonthlyCollections });
  const { data: upcomingInstallments } = useQuery({ queryKey: ['upcomingInstallments'], queryFn: getUpcomingInstallments });
  const { data: recentTransactions } = useQuery({ queryKey: ['recentTransactions'], queryFn: getRecentTransactions });
  const { data: cashFlowProjection } = useQuery({ queryKey: ['cashFlowProjection'], queryFn: getCashFlowProjection });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-main tracking-tight">Hola, {user?.nombre || 'Usuario'}! 👋</h2>
          <p className="text-muted mt-1">Aquí tienes el resumen de hoy, {new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        
        {/* Quick Actions */}
        <div className="flex gap-3">
            <Link to="/loans/create" className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors shadow-lg shadow-primary-500/20 font-medium">
                <Plus className="h-4 w-4" />
                <span>Nuevo Préstamo</span>
            </Link>
            <Link to="/borrowers/create" className="flex items-center gap-2 px-4 py-2 bg-surfaceHighlight hover:bg-border text-main rounded-lg transition-colors border border-border font-medium">
                <UserPlus className="h-4 w-4" />
                <span>Nuevo Cliente</span>
            </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Link to="/loans?view=history" className="block h-full transition-transform hover:scale-[1.02] cursor-pointer">
            <KPIWidget
            title="Total Prestado Historico"
            value={kpis ? `$${kpis.totalPrestadoHistorico.toLocaleString()}` : '...'}
            icon={DollarSign}
            trend="+12.5%"
            trendUp={true}
            iconColor="bg-primary-500/10 text-primary-400"
            description="Suma total acumulada de todos los préstamos otorgados desde el inicio de operaciones."
            className="h-full"
            loading={isLoadingKpis}
            />
        </Link>
        <Link to="/borrowers" className="block h-full transition-transform hover:scale-[1.02] cursor-pointer">
            <KPIWidget
            title="Morosidad"
            value={kpis ? `${kpis.porcentajeMorosidad}%` : '...'}
            icon={AlertTriangle}
            trend="-2.1%"
            trendUp={true}
            iconColor="bg-red-500/10 text-red-400"
            description="Porcentaje de clientes con cuotas vencidas (más de 1 día de retraso) respecto al total de clientes activos."
            className="h-full"
            loading={isLoadingKpis}
            />
        </Link>
        <Link to="/payments?view=profitability" className="block h-full transition-transform hover:scale-[1.02] cursor-pointer">
            <KPIWidget
            title="Rentabilidad"
            value={kpis ? `${kpis.rentabilidad}%` : '...'}
            icon={TrendingUp}
            trend="+5.4%"
            trendUp={true}
            iconColor="bg-emerald-500/10 text-emerald-400"
            description="Margen de ganancia calculado sobre los intereses generados vs el capital prestado."
            className="h-full"
            loading={isLoadingKpis}
            />
        </Link>
        <Link to="/loans?status=1" className="block h-full transition-transform hover:scale-[1.02] cursor-pointer">
            <KPIWidget
            title="Capital Pendiente"
            value={kpis ? `$${kpis.capitalPendiente.toLocaleString()}` : '...'}
            icon={Users}
            iconColor="bg-blue-500/10 text-blue-400"
            description="Monto total de dinero que aún está pendiente de cobro (Capital + Intereses por vencer)."
            className="h-full"
            loading={isLoadingKpis}
            />
        </Link>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cash Flow Projection Chart */}
        <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-main">Proyección de Flujo de Caja</h3>
                        <InfoTooltip content="Proyección de ingresos basada en las cuotas a cobrar durante las próximas 4 semanas." />
                    </div>
                    <p className="text-sm text-muted">Ingresos estimados próximos 30 días</p>
                </div>
                <div className="p-2 bg-green-500/10 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
            </div>
            <div className="h-[300px] w-full min-w-0">
                {cashFlowProjection && cashFlowProjection.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={cashFlowProjection} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={THEME_COLORS.grid} />
                            <XAxis 
                                dataKey="etiqueta" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: axisColor, fontSize: 12 }} 
                                dy={10}
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: axisColor, fontSize: 12 }} 
                                tickFormatter={(value) => `$${value/1000}k`}
                            />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: THEME_COLORS.tooltipBg, 
                                    borderColor: THEME_COLORS.tooltipBorder, 
                                    color: THEME_COLORS.text,
                                    borderRadius: '8px'
                                }}
                                formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Monto Estimado']}
                                labelStyle={{ color: THEME_COLORS.text }}
                            />
                            <Bar 
                                dataKey="valor" 
                                fill="#10B981" 
                                radius={[4, 4, 0, 0]} 
                                barSize={40}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <ChartEmptyState message="No hay proyecciones disponibles" />
                )}
            </div>
        </div>

        {/* Monthly Collections Chart */}
        <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
             <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-main">Ingresos Mensuales</h3>
                <InfoTooltip content="Muestra el total de dinero recaudado por mes. Eje X: Meses del año. Eje Y: Monto total cobrado en pesos." />
             </div>
             <p className="text-sm text-muted">Histórico de recaudación anual</p>
            </div>
          </div>
          <div className="h-[300px] w-full min-w-0">
            {monthlyCollections && monthlyCollections.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyCollections}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="mes" stroke={axisColor} />
                <YAxis stroke={axisColor} />
                <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-main)' }}
                    itemStyle={{ color: 'var(--color-text-main)' }}
                />
                <Bar dataKey="valor" fill="#A855F7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            ) : (
                <ChartEmptyState message="No hay datos de ingresos" />
            )}
          </div>
        </div>

        {/* Loans Trend (Line Chart) */}
        <div className="glass-panel rounded-2xl p-6 relative z-10 overflow-visible">
          <div className="flex items-center justify-between mb-6">
            <div>
                <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-main">Tendencia de Colocación</h3>
                    <InfoTooltip content="Muestra el volumen de nuevos préstamos otorgados por mes. Eje X: Meses del año. Eje Y: Monto total prestado en pesos." />
                </div>
                <p className="text-sm text-muted">Evolución de préstamos otorgados</p>
            </div>
          </div>
          <div className="h-[300px]">
            {loansTrend && loansTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={loansTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="mes" stroke={axisColor} />
                <YAxis stroke={axisColor} />
                <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-main)' }}
                />
                <Line type="monotone" dataKey="valor" stroke="#10B981" strokeWidth={3} dot={{ fill: '#10B981', r: 4 }} activeDot={{ r: 6, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
            ) : (
                <ChartEmptyState message="No hay datos de tendencias" />
            )}
          </div>
        </div>

        {/* Loans By Status (Pie Chart) - Moved here */}
        <div className="glass-panel rounded-2xl p-6 relative z-10 overflow-visible">
          <div className="flex items-center justify-between mb-6">
            <div>
                <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-main">Composición de Cartera</h3>
                    <InfoTooltip content="Distribución de los préstamos activos según su estado actual (Al día, En Mora, Finalizado, etc.)." />
                </div>
                <p className="text-sm text-muted">Estado actual de préstamos activos</p>
            </div>
          </div>
          <div className="h-[300px] w-full min-w-0">
            {loansByStatus && loansByStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={loansByStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="valor"
                  nameKey="etiqueta"
                  stroke="none"
                >
                  {loansByStatus.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                     contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-main)' }}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
            ) : (
                <ChartEmptyState message="No hay préstamos activos" />
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row: Upcoming Installments & Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
         {/* Upcoming Installments Table */}
         <div className="col-span-2 glass-panel rounded-2xl p-6 relative z-10 overflow-visible">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <h3 className="text-lg font-bold text-main">Próximos Vencimientos</h3>
                    <InfoTooltip content="Lista de cuotas que vencen en los próximos días. Incluye nombre del cliente, fecha límite y monto a cobrar." />
                </div>
                <Link to="/payments" className="text-sm text-primary-500 hover:text-primary-600 transition-colors">Ver todos</Link>
            </div>
            <div className="overflow-x-auto">
                {upcomingInstallments && upcomingInstallments.length > 0 ? (
                <table className="w-full text-sm text-left">
                    <thead className="text-muted border-b border-border">
                        <tr>
                            <th className="px-4 py-3 font-medium">Cliente</th>
                            <th className="px-4 py-3 font-medium">Vencimiento</th>
                            <th className="px-4 py-3 font-medium">Monto</th>
                            <th className="px-4 py-3 font-medium">Estado</th>
                            <th className="px-4 py-3 font-medium text-right">Acción</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {upcomingInstallments?.map((installment, index) => {
                          const daysToMaturity = calculateDaysToMaturity(installment.fechaVencimiento);
                          return (
                        <tr key={index} className="group hover:bg-surfaceHighlight/50 transition-colors">
                            <td className="px-4 py-4 font-medium text-main">{installment.nombrePrestatario} {installment.apellidoPrestatario}</td>
                            <td className="px-4 py-4 text-muted">{formatDate(installment.fechaVencimiento)}</td>
                            <td className="px-4 py-4 font-bold text-main">{formatCurrency(installment.monto)}</td>
                            <td className="px-4 py-4">
                                <StatusBadge variant={
                                    daysToMaturity < 0 ? 'error' : 
                                    daysToMaturity <= 3 ? 'warning' : 'success'
                                }>
                                    {daysToMaturity < 0 ? 'Vencido' : `${daysToMaturity} días`}
                                </StatusBadge>
                            </td>
                            <td className="px-4 py-4 text-right">
                                <button className="text-muted hover:text-main transition-colors">Detalles</button>
                            </td>
                        </tr>
                        )})}
                    </tbody>
                </table>
                ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-muted">
                        <div className="p-4 rounded-full bg-surfaceHighlight mb-3">
                            <Users className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="font-medium">No hay vencimientos próximos</p>
                        <p className="text-sm mt-1">¡Estás al día con los cobros!</p>
                    </div>
                )}
            </div>
         </div>

         {/* Recent Activity Feed */}
         <div className="glass-panel rounded-2xl p-6 relative z-10 overflow-visible">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <h3 className="text-lg font-bold text-main">Actividad Reciente</h3>
                    <InfoTooltip content="Historial en tiempo real de las últimas operaciones registradas (Nuevos préstamos otorgados y Pagos recibidos)." />
                </div>
            </div>
            <div className="space-y-4">
                {recentTransactions && recentTransactions.length > 0 ? (
                    recentTransactions.map((tx, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-surfaceHighlight/50 transition-colors border border-transparent hover:border-border">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full ${tx.type === 'Pago' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                    {tx.type === 'Pago' ? <DollarSign className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-main">{tx.entityName}</p>
                                    <p className="text-xs text-muted">{tx.type} • {new Date(tx.date).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`text-sm font-bold ${tx.type === 'Pago' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {tx.type === 'Pago' ? '+' : '-'} {formatCurrency(tx.amount)}
                                </p>
                                <p className="text-xs text-muted">{tx.status}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-muted text-center py-4">No hay actividad reciente</p>
                )}
                
                <Link to="/loans" className="w-full mt-2 py-2 text-sm text-primary-500 hover:text-primary-600 font-medium flex items-center justify-center gap-1 transition-colors">
                    Ver todo el historial <ArrowRight className="h-4 w-4" />
                </Link>
            </div>
         </div>

      </div>
    </div>
  );
}
