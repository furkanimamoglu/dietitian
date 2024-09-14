import React from 'react';

import { Sidebar as SidebarPro, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import { FaHome, FaUser, FaCog } from 'react-icons/fa';
import { Link } from 'react-router-dom';

export default function Sidebar() {
    return (
        <SidebarPro>
            <Menu iconShape="circle">
                <MenuItem icon={<FaHome />} to="/dashboard">
                    Ana Sayfa
                </MenuItem>
                <SubMenu title="User" icon={<FaUser />} label="test">
                    <Link to="/clients">
                        <MenuItem icon={<FaUser />}>
                            Clients
                        </MenuItem>
                    </Link>
                </SubMenu>
                <MenuItem icon={<FaUser />} to="/dashboard">
                    Dashboard
                </MenuItem>
                <MenuItem icon={<FaCog />} to="/settings">
                    Settings
                </MenuItem>
            </Menu>
        </SidebarPro>
    );
};