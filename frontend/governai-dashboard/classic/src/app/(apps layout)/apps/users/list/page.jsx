'use client';
import { useState } from 'react';
import classNames from 'classnames';
import UsersAppBody from './UsersAppBody';
import AdminSidebar from '../AdminSidebar';
import UsersHeader from '../UsersHeader';

const UsersList = () => {
  const [showSidebar, setShowSidebar] = useState(true);
  const [triggerExportCSV, setTriggerExportCSV] = useState(0);

  return (
    <div className="hk-pg-body py-0">
      <div className={classNames("fmapp-wrap", { "fmapp-sidebar-toggle": !showSidebar })}>
        <AdminSidebar />
        <div className="fmapp-content">
          <div className="fmapp-detail-wrap">
            <UsersHeader 
              showSidebar={showSidebar} 
              toggleSidebar={() => setShowSidebar(!showSidebar)}
              onExportCSV={() => setTriggerExportCSV(prev => prev + 1)}
            />
            <UsersAppBody 
              triggerExportCSV={triggerExportCSV}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersList;
