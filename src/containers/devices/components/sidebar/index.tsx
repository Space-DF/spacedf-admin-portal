'use client';
import { ChevronLeft, ChevronRight, LayoutGrid, Palette } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';

import {
  Monitor,
  SidebarCollapsedSimple,
  SidebarSimpleIcon,
  Waves,
} from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import SidebarItem from '@/containers/devices/components/sidebar/components/sidebar-item';
import { useOrganization } from '@/containers/devices/components/sidebar/hooks/useOrganization';

import { Link, usePathname } from '@/i18n/routing';
import { getColorText, getShortName, textToHexColor } from '@/utils';

import deviceIcon from '/public/images/device.svg';

interface Props {
  slugName: string;
}

const OrganizationSidebar = ({ slugName }: Props) => {
  const t = useTranslations('organization');
  const { data: organization, isLoading } = useOrganization();

  const { setOpen, open } = useSidebar();
  const pathname = usePathname();

  const organizationName = organization?.name || '';

  const customDomainPath = `/organizations/${slugName}/white-label/custom-domain`;
  const brandCustomizationPath = `/organizations/${slugName}/white-label/brand-customization`;
  const waterLevelPath = `/organizations/${slugName}/monitoring/water-level`;

  const isCustomDomainActive = pathname.includes(customDomainPath);
  const isBrandCustomizationActive = pathname.includes(brandCustomizationPath);
  const isWhiteLabelActive = isCustomDomainActive || isBrandCustomizationActive;

  const isWaterLevelActive = pathname.includes(waterLevelPath);
  const isMonitoringActive = isWaterLevelActive;

  const isSmartFleetMonitorTemplate =
    organization?.template === 'smart_fleet_monitor';

  const navMain = [
    ...(isSmartFleetMonitorTemplate
      ? [
          {
            title: t('monitoring_settings'),
            url: '#',
            icon: Monitor,
            isActive: isMonitoringActive,
            items: [
              {
                title: t('water_level'),
                url: waterLevelPath,
                icon: Waves,
                isActive: isWaterLevelActive,
              },
            ],
          },
        ]
      : []),
    {
      title: t('white_label_studio'),
      url: '#',
      icon: LayoutGrid,
      isActive: isWhiteLabelActive,
      items: [
        {
          title: t('brand_customization'),
          url: brandCustomizationPath,
          icon: Palette,
          isActive: isBrandCustomizationActive,
        },
      ],
    },
  ];

  return (
    <Sidebar collapsible='icon'>
      <div className='h-full border-r border-brand-component-stroke-dark-soft flex flex-col overflow-y-auto bg-background shadow-sm'>
        <div className='mx-2 pt-5 pb-3'>
          <div
            className={cn(
              'flex items-center',
              open ? 'space-x-3' : 'space-y-3 flex-col',
            )}
          >
            <div
              className={cn(
                'flex items-center border rounded-xl border-brand-component-stroke-dark-soft p-1 h-12 font-semibold',
                open && 'pr-4 space-x-2 w-full',
              )}
            >
              {isLoading ? (
                <Skeleton className='size-10 rounded-lg' />
              ) : (
                <div
                  className='bg-brand-component-fill-secondary-soft size-10 flex items-center justify-center text-brand-component-text-secondary rounded-lg'
                  style={{
                    background: textToHexColor(organizationName),
                    color:
                      getColorText(textToHexColor(organizationName)) ||
                      '#4006AA',
                  }}
                >
                  {getShortName(organizationName)}
                </div>
              )}
              {open &&
                (isLoading ? (
                  <div className='flex flex-col gap-1.5'>
                    <Skeleton className='w-14 h-2' />
                    <Skeleton className='w-16 h-5 rounded-md' />
                  </div>
                ) : (
                  <div className='flex min-w-0 flex-col gap-1'>
                    <p className='text-body text-brand-heading font-semibold leading-tight max-w-24 truncate'>
                      {organizationName}
                    </p>
                  </div>
                ))}
            </div>
            <SidebarTrigger
              onClick={() => setOpen(!open)}
              icon={
                open ? (
                  <SidebarSimpleIcon className='cursor-pointer justify-self-end text-brand-text-gray' />
                ) : (
                  <SidebarCollapsedSimple className='col-span-1 cursor-pointer justify-self-end text-brand-text-gray' />
                )
              }
            />
          </div>
        </div>
        <SidebarContent>
          <div className='flex flex-col w-full px-2'>
            <SidebarGroup>
              <SidebarMenu className='flex flex-col w-full space-y-0.5'>
                <SidebarItem
                  open={open}
                  label={t('device_hub')}
                  href={`/organizations/${slugName}/devices`}
                  icon={deviceIcon}
                />
                {navMain.map((item) =>
                  open ? (
                    <Collapsible
                      key={item.title}
                      asChild
                      defaultOpen={item.isActive}
                      className='group/collapsible'
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <button className='flex rounded-[10px] items-center gap-x-2 text-brand-component-text-dark text-sm font-medium p-2 transition-all group/btn hover:bg-brand-component-fill-dark-soft duration-150 w-full h-auto outline-none'>
                            <div className='flex justify-between items-center w-full'>
                              <div className='flex items-center gap-x-2 min-w-0'>
                                {item.icon && (
                                  <item.icon
                                    size={16}
                                    className='shrink-0 text-brand-component-text-dark transition-colors duration-150 group-hover/btn:text-brand-component-text-dark'
                                  />
                                )}
                                <span className='truncate whitespace-nowrap text-brand-component-text-dark transition-colors duration-150 group-hover/btn:text-brand-component-text-dark text-body'>
                                  {item.title}
                                </span>
                              </div>
                              <ChevronRight
                                size={16}
                                className='shrink-0 text-brand-component-text-dark transition-transform duration-200 group-hover/btn:text-brand-component-text-dark ml-auto group-data-[state=open]/collapsible:rotate-90'
                              />
                            </div>
                          </button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub className='pl-2 my-1 flex flex-col ml-3.5'>
                            {item.items?.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={subItem.isActive}
                                  className={cn(
                                    'flex items-center gap-x-2 text-brand-component-text-dark text-sm font-semibold py-2 pl-3 pr-2 transition-all rounded-[10px] group/sub hover:bg-brand-component-fill-dark-soft duration-150 h-auto w-full',
                                    subItem.isActive &&
                                      'bg-brand-component-fill-dark-soft text-brand-component-text-dark font-semibold',
                                  )}
                                >
                                  <Link href={subItem.url}>
                                    {subItem.icon && (
                                      <subItem.icon
                                        size={16}
                                        className={cn(
                                          'text-brand-component-text-dark transition-colors duration-150 group-hover/sub:text-brand-component-text-dark',
                                          subItem.isActive &&
                                            'text-brand-component-text-dark',
                                        )}
                                      />
                                    )}
                                    <span className='text-brand-component-text-dark transition-colors duration-150 group-hover/sub:text-brand-component-text-dark text-body'>
                                      {subItem.title}
                                    </span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  ) : (
                    <DropdownMenu key={item.title}>
                      <SidebarMenuItem>
                        <DropdownMenuTrigger asChild>
                          <button
                            className={cn(
                              'flex items-center gap-x-2 text-brand-component-text-dark text-sm font-medium p-2 transition-all rounded-[10px] group/btn hover:bg-brand-component-fill-dark-soft duration-150 mx-auto w-fit h-auto outline-none',
                              item.isActive &&
                                'text-brand-component-text-dark font-semibold',
                            )}
                          >
                            <div className='flex justify-center items-center'>
                              {item.icon && (
                                <item.icon
                                  size={16}
                                  className='text-brand-component-text-dark transition-colors duration-150 group-hover/btn:text-brand-component-text-dark'
                                />
                              )}
                            </div>
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          side='right'
                          align='start'
                          className='bg-brand-component-fill-light ring-0 text-brand-component-text-dark p-2 rounded-md border-none flex flex-col gap-y-1 min-w-48 z-[9999]'
                        >
                          {item.items?.map((subItem) => (
                            <DropdownMenuItem key={subItem.title} asChild>
                              <Link
                                href={subItem.url}
                                className={cn(
                                  'flex text-[14px] items-center gap-x-2 py-2 px-2.5 rounded-md hover:bg-brand-component-fill-dark-soft transition-colors text-brand-component-text-dark hover:text-brand-component-text-dark cursor-pointer font-medium group/item',
                                  subItem.isActive &&
                                    'text-brand-component-text-dark font-semibold bg-brand-component-fill-dark-soft',
                                )}
                              >
                                {subItem.icon && (
                                  <subItem.icon
                                    size={16}
                                    className={cn(
                                      'text-brand-component-text-dark transition-colors group-hover/item:text-brand-component-text-dark',
                                      subItem.isActive &&
                                        'text-brand-component-text-dark',
                                    )}
                                  />
                                )}
                                <span>{subItem.title}</span>
                              </Link>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </SidebarMenuItem>
                    </DropdownMenu>
                  ),
                )}
              </SidebarMenu>
            </SidebarGroup>
          </div>
        </SidebarContent>
      </div>
      <SidebarFooter className='gap-3 border-r border-brand-component-stroke-dark-soft bg-background'>
        <Button
          variant='outline'
          className={cn(
            'rounded-xl h-9',
            open ? 'py-3 w-full' : 'mx-auto w-9 p-0',
          )}
          asChild
        >
          <Link
            href='/organizations'
            className='font-medium flex items-center justify-center gap-x-1 text-brand-component-text-dark'
          >
            <ChevronLeft size={16} />
            {open && t('back_to_organization_list')}
          </Link>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default OrganizationSidebar;
