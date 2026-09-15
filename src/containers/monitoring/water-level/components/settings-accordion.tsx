import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface Props {
  value: string;
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  description?: string;
}

export const SettingsAccordion = ({
  value,
  icon,
  title,
  children,
  description,
}: Props) => (
  <Accordion
    type='single'
    collapsible
    className='w-full rounded-xl border border-brand-component-stroke-dark-soft bg-background'
  >
    <AccordionItem value={value} className='border-b-0 px-3'>
      <AccordionTrigger className='group/accordion items-start py-3 hover:no-underline [&>svg]:size-5 [&>svg]:text-brand-component-text-dark'>
        <div className='flex min-w-0 flex-1 flex-col items-start'>
          <div className='flex items-center gap-x-2'>
            {icon}
            <span className='text-body font-semibold text-brand-component-text-dark'>
              {title}
            </span>
          </div>
          {description && (
            <div className='grid grid-rows-[0fr] opacity-0 transition-all duration-200 ease-out group-data-[state=open]/accordion:grid-rows-[1fr] group-data-[state=open]/accordion:opacity-100'>
              <p className='overflow-hidden pt-1 text-left text-body font-normal text-brand-component-text-gray'>
                {description}
              </p>
            </div>
          )}
        </div>
      </AccordionTrigger>
      <AccordionContent className='pb-3 pt-0'>{children}</AccordionContent>
    </AccordionItem>
  </Accordion>
);
