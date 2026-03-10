import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Outlet } from 'react-router-dom';
import { Spinner } from '@/components/ui/Spinner';

import fallbackRender from './fallback';
import { Header } from './header';

const LayoutComponent = () => {
  return (
    <div className="h-full w-full">
      <Header />
      <div className="flex flex-col">
        <ErrorBoundary fallbackRender={fallbackRender}>
          <Suspense
            fallback={
              <div className="flex h-full w-full items-center justify-center">
                <span>
                  <Spinner />
                </span>
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default LayoutComponent;
