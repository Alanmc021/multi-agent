'use client';
import { useState } from 'react';
import classNames from 'classnames';
import MonitoringBody from './MonitoringBody';
import AdminSidebar from '../users/AdminSidebar';
import MonitoringHeader from './MonitoringHeader';

const MonitoringPage = () => {
  const [showSidebar, setShowSidebar] = useState(true);

  return (
    <div className="hk-pg-body py-0">
      <div className={classNames("fmapp-wrap", { "fmapp-sidebar-toggle": !showSidebar })}>
        <AdminSidebar />
        <div className="fmapp-content">
          <div className="fmapp-detail-wrap">
            <MonitoringHeader 
              showSidebar={showSidebar} 
              toggleSidebar={() => setShowSidebar(!showSidebar)} 
            />
            <MonitoringBody />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonitoringPage;

