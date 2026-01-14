import { QuestionMarkCircledIcon } from '@radix-ui/react-icons';
import { Copy, CopyCheck } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useNetworkServer } from '@/containers/devices/components/add-device-modal/components/select-network-server/hooks/useNetworkServer';
import NetworkServers from '@/containers/devices/containers/device-detail/components/general/components/activation-information/components/select-network/components/network-server';

import { NetworkServer } from '@/types';

import NodataSVG from '/public/images/nodata.svg';

interface Props {
  networkServer?: NetworkServer;
  setNetworkServer: (networkServer: NetworkServer) => void;
  isEditing: boolean;
}

export const SelectNetwork: React.FC<Props> = ({
  networkServer,
  setNetworkServer,
  isEditing,
}) => {
  const { data: networkResults, isLoading } = useNetworkServer();
  const [isCopied, setIsCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNetworkServer, setSelectedNetworkServer] = useState<
    NetworkServer | undefined
  >(networkServer);

  useEffect(() => {
    setSelectedNetworkServer(networkServer);
  }, [networkServer]);

  const lorawanUrl = `https://api.spacedf.net/intergrations/lorawan/${selectedNetworkServer?.name.toLowerCase()}/`;
  const t = useTranslations('device-detail');

  const networkServers = networkResults?.results || [];

  const handleCopy = async () => {
    setIsCopied(true);
    try {
      await navigator.clipboard.writeText(lorawanUrl);
    } catch {
      setIsCopied(false);
    }
    setTimeout(() => {
      setIsCopied(false);
    }, 1000);
  };

  const handleSave = () => {
    if (selectedNetworkServer) {
      setNetworkServer(selectedNetworkServer);
      setIsOpen(false);
      setSelectedNetworkServer(undefined);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant='outline' size='sm' type='button' disabled={!isEditing}>
          {t('change_network')}
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-4xl'>
        <DialogTitle className='text-[16px] font-semibold text-brand-component-text-dark'>
          {t('change_network')}
        </DialogTitle>
        <div className='space-y-6 mt-6'>
          <div className='space-y-4'>
            <span className='text-brand-component-text-dark text-[16px] font-semibold'>
              {t('select_network')}
            </span>
            {networkServers.length || isLoading ? (
              <div className='grid grid-cols-3 gap-2'>
                <NetworkServers
                  networkServers={networkServers}
                  isLoading={isLoading}
                  currentNetworkServer={selectedNetworkServer}
                  setCurrentNetworkServer={setSelectedNetworkServer}
                />
              </div>
            ) : (
              <div className='h-32 w-full flex items-center justify-center'>
                <div className='flex flex-col space-y-2'>
                  <Image
                    src={NodataSVG}
                    alt='nodata'
                    className='h-full w-full max-w-44 object-contain flex justify-center items-center'
                  />
                  <p className='mt-3 text-wrap text-center text-base font-normal text-brand-component-text-dark'>
                    No results found
                  </p>
                </div>
              </div>
            )}

            {selectedNetworkServer && (
              <div className='space-y-4'>
                <div className='flex items-center space-x-3'>
                  <span className='text-brand-component-text-dark text-[16px] font-semibold leading-6'>
                    {t('integrate')} {selectedNetworkServer.name}{' '}
                  </span>
                  <QuestionMarkCircledIcon className='size-4 text-brand-icon-gray' />
                </div>

                <div className='space-y-2'>
                  <div className='flex items-center space-x-1.5 h-12'>
                    <Input disabled value={lorawanUrl} className='h-full' />
                    <Button
                      className='space-x-2 flex items-center h-full'
                      onClick={handleCopy}
                      disabled={isCopied}
                    >
                      <span>{t(isCopied ? 'copied' : 'copy')}</span>
                      {isCopied ? <CopyCheck size={20} /> : <Copy size={20} />}
                    </Button>
                  </div>
                  <div className='flex space-x-2 items-center text-base leading-5'>
                    <span className='text-brand-component-text-gray font-medium'>
                      {t('configure_lorawan_network')}
                    </span>
                    <span className='text-brand-component-text-dark-hover font-semibold'>
                      {t('check_our_guideline')}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <Separator className='my-6' />
        <DialogFooter>
          <DialogClose asChild>
            <Button
              type='button'
              variant='outline'
              className='text-brand-component-text-gray'
              size='xl'
            >
              {t('cancel')}
            </Button>
          </DialogClose>

          <Button size='xl' onClick={handleSave}>
            {t('save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
