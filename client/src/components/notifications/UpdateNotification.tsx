import { Fragment } from 'react';
import { Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { InformationCircleIcon } from '@heroicons/react/24/solid';

interface UpdateNotificationProps {
  type: 'available' | 'downloaded';
  onClose: () => void;
}

export default function UpdateNotification({ type, onClose }: UpdateNotificationProps) {
  const title = type === 'available' 
    ? 'Update Available' 
    : 'Update Ready to Install';
  
  const message = type === 'available'
    ? 'A new version of SneakerBot is available and is being downloaded.'
    : 'A new version of SneakerBot has been downloaded and is ready to install.';
  
  const action = type === 'downloaded'
    ? (
      <button
        className="btn-primary text-xs"
        onClick={() => {
          window.api.checkForUpdates();
          onClose();
        }}
      >
        Restart & Install
      </button>
    )
    : null;

  return (
    <div className="fixed bottom-0 right-0 p-6 z-50">
      <Transition
        show={true}
        as={Fragment}
        enter="transform ease-out duration-300 transition"
        enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
        enterTo="translate-y-0 opacity-100 sm:translate-x-0"
        leave="transition ease-in duration-100"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="max-w-sm w-full bg-wsb-dark-panel shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5">
          <div className="p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <InformationCircleIcon className="h-6 w-6 text-blue-500" aria-hidden="true" />
              </div>
              <div className="ml-3 w-0 flex-1 pt-0.5">
                <p className="text-sm font-medium text-wsb-text">{title}</p>
                <p className="mt-1 text-sm text-wsb-text-secondary">{message}</p>
                {action && <div className="mt-3">{action}</div>}
              </div>
              <div className="ml-4 flex-shrink-0 flex">
                <button
                  className="bg-wsb-dark-panel rounded-md inline-flex text-wsb-text-secondary hover:text-wsb-text focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-wsb-primary"
                  onClick={onClose}
                >
                  <span className="sr-only">Close</span>
                  <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  );
}
