import { ChevronsUpDown, Pencil, PlusIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { KpiCard } from '@/containers/white-label/brand-customization/components/brand-style-preview/components/dashboard/components/kpi-card';
import { SvgAreaChart } from '@/containers/white-label/brand-customization/components/brand-style-preview/components/dashboard/components/svg-area-chart';

export const Dashboard = () => {
  return (
    <div className='flex h-full flex-col'>
      <div className='flex w-full'>
        <div className='flex flex-1 items-center gap-2 pl-4 pr-2 pt-4'>
          <div className='flex flex-1 flex-wrap items-center justify-between gap-2 duration-300'>
            <div className='text-base font-semibold text-brand-component-text-dark dark:text-white'>
              <Button
                variant='outline'
                role='combobox'
                className='line-clamp-1 border border-[--border-color] flex h-8 justify-between gap-2 whitespace-normal px-2 py-1 bg-[--input-color] text-[--text-color] dark:bg-brand-background-fill-surface rounded-[--input-border-radius]'
              >
                <div className='line-clamp-1 w-full flex-1 text-left'>
                  Smart Building
                </div>
                <ChevronsUpDown className='size-4 shrink-0 opacity-50 text-[--support-text-color]' />
              </Button>
            </div>
            <Button
              size='icon'
              className='size-8 gap-2 rounded-[--button-border-radius] bg-[--primary-color] dark:bg-[--primary-color] hover:bg-[--primary-color] !text-[--primary-text-color]'
            >
              <Pencil size={16} />
            </Button>
          </div>
        </div>
        <div className='flex items-center gap-2 pr-4 pt-4'>
          <div className='group h-max cursor-pointer rounded-sm p-1'>
            <PlusIcon
              size={18}
              className='rotate-45 duration-300 group-hover:-rotate-45 group-hover:scale-110 text-[--support-text-color]'
            />
          </div>
        </div>
      </div>
      <div className='flex-1 shrink-0 dark:text-brand-dark-text-gray px-4 py-4 overflow-y-auto scroll-smooth transition-all [&::-webkit-scrollbar-thumb]:bg-transparent [&::-webkit-scrollbar-thumb]:hover:bg-[#282C3F]'>
        <div className='flex flex-col gap-0.5 pb-20'>
          <div className='grid grid-cols-3 gap-0.5'>
            <KpiCard
              title={
                <span>
                  CO<sub>2</sub>
                </span>
              }
              value='920'
              unit='ppm'
            />
            <KpiCard title='Particulate Matter' value='42' unit='μg/m³' />
            <KpiCard title='AQI' value='135' />
          </div>
          <div className='grid grid-cols-2 gap-0.5'>
            <KpiCard title='Current Power Usage' value='42.8' unit='kW' />
            <KpiCard title='Today Usage' value='512' unit='kW' />
          </div>
          <SvgAreaChart
            title='Power Consumption (kW over Time)'
            labelsX={['9', '9:30', '10:00', '10:30', '11:00']}
            labelsY={[6, 8, 10, 12, 14, 16]}
            minY={6}
            maxY={16}
            yAxisLabel='Power (kW)'
            series={[
              {
                name: 'NetVox R718N17',
                data: [14.5, 13, 14.5, 12, 15],
                color: '#22C55E',
                gradientId: 'power-grad',
              },
            ]}
          />
          <div className='grid grid-cols-2 gap-0.5'>
            <KpiCard title='Water Usage' value='42.8' unit='kW' />
            <KpiCard title='Today Usage' value='512' unit='kW' />
          </div>
          <SvgAreaChart
            title='Water Usage (L/min over Time)'
            labelsX={['9', '9:30', '10:00', '10:30', '11:00']}
            labelsY={[6, 8, 10, 12, 14, 16]}
            minY={6}
            maxY={16}
            yAxisLabel='Flow Rate (L/min)'
            series={[
              {
                name: 'Water Usage Monitoring',
                data: [14.5, 13, 14, 12, 15],
                color: '#3B82F6',
                gradientId: 'water-grad',
              },
            ]}
          />
          <div className='grid grid-cols-2 gap-0.5'>
            <KpiCard title='Humidity' value='68' unit='%' />
            <KpiCard title='Temperature' value='27.5' unit='°C' />
          </div>
          <SvgAreaChart
            title='Humidity and Temperature'
            labelsX={[
              '9',
              '9:30',
              '10:00',
              '10:30',
              '11:00',
              '11:30',
              '12:00',
              '12:30',
              '13:00',
              '13:30',
              '14:00',
            ]}
            labelsY={[0, 15, 30, 45, 60, 75]}
            minY={0}
            maxY={75}
            series={[
              {
                name: 'Humidity',
                data: [58, 52, 58, 52, 58, 56, 58, 42, 42, 52, 62],
                color: '#EC4899',
                gradientId: 'humidity-grad',
              },
              {
                name: 'Temperature',
                data: [30, 22, 30, 22, 30, 22, 30, 22, 15, 22, 28],
                color: '#F97316',
                gradientId: 'temp-grad',
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
};
