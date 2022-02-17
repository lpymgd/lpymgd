import React, { Suspense } from 'react';
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';
import { TcProvider, useColorScheme, useLanguage } from 'tailchat-shared';
import clsx from 'clsx';
import { Loadable } from './components/Loadable';
import { ConfigProvider as AntdProvider } from 'antd';
import { Helmet } from 'react-helmet';
import { useRecordMeasure } from './utils/measure-helper';
import { getPopupContainer, preventDefault } from './utils/dom-helper';
import { LoadingSpinner } from './components/LoadingSpinner';
import { pluginRootRouter } from './plugin/common';
import { PortalHost as FallbackPortalHost } from './components/Portal';

const MainRoute = Loadable(() => import('./routes/Main'));

const EntryRoute = Loadable(() => import('./routes/Entry'));

const PanelRoute = Loadable(() => import('./routes/Panel'));

const InviteRoute = Loadable(() => import('./routes/Invite'));

const AppProvider: React.FC = React.memo((props) => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <BrowserRouter>
        <TcProvider>
          <AntdProvider getPopupContainer={getPopupContainer}>
            {props.children}
          </AntdProvider>
        </TcProvider>
      </BrowserRouter>
    </Suspense>
  );
});
AppProvider.displayName = 'AppProvider';

const AppContainer: React.FC = React.memo((props) => {
  const { isDarkMode, extraSchemeName } = useColorScheme();

  return (
    <div
      id="tailchat-app"
      className={clsx(
        'absolute inset-0 select-none',
        {
          dark: isDarkMode,
        },
        extraSchemeName
      )}
      onContextMenu={preventDefault}
    >
      {props.children}
    </div>
  );
});
AppContainer.displayName = 'AppContainer';

const AppHeader: React.FC = React.memo(() => {
  const { language } = useLanguage();

  return (
    <Helmet>
      <meta httpEquiv="Content-Language" content={language} />
    </Helmet>
  );
});
AppHeader.displayName = 'AppHeader';

export const App: React.FC = React.memo(() => {
  useRecordMeasure('AppRenderStart');

  return (
    <AppProvider>
      <AppHeader />
      <AppContainer>
        <Switch>
          <Route path="/entry" component={EntryRoute} />
          <Route path="/main" component={MainRoute} />
          <Route path="/panel" component={PanelRoute} />
          <Route path="/invite/:inviteCode" component={InviteRoute} />
          {/* 这个host用于处理独立页面的modal */}
          {/* NOTICE: Switch里不能出现动态路由 */}
          {/* <FallbackPortalHost>
            {pluginRootRouter.map((r, i) => (
              <Route
                key={r.name}
                path={r.path || `/fallback${i}`}
                component={r.component}
              />
            ))}
          </FallbackPortalHost> */}
          <Redirect to="/entry" />
        </Switch>
      </AppContainer>
    </AppProvider>
  );
});
App.displayName = 'App';
