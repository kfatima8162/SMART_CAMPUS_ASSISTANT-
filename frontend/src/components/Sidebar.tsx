import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  MessageSquareIcon,
  SettingsIcon,
  BotIcon,
  PlusIcon
} from 'lucide-react';
import { motion } from 'framer-motion';

export function Sidebar() {
  const location = useLocation();

  const navItems = [
    {
      path: '/chat',
      icon: MessageSquareIcon,
      label: 'Chat'
    },
    {
      path: '/settings',
      icon: SettingsIcon,
      label: 'Settings'
    }
  ];

  return (
    <div className="w-64 bg-slate-900 text-white flex flex-col h-full">

      {/* Header */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <BotIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-semibold text-sm">CollegeAssistant</h2>
            <p className="text-xs text-slate-400">AI Support</p>
          </div>
        </div>

        <Link
          to="/chat"
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-sm"
        >
          <PlusIcon className="w-4 h-4" />
          New Chat
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link key={item.path} to={item.path} className="relative">
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-slate-800 rounded-lg"
                  transition={{
                    type: 'spring',
                    bounce: 0.2,
                    duration: 0.6
                  }}
                />
              )}
              <div
                className={`relative flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-slate-800 text-center">
        <p className="text-xs text-slate-400">
          © College Assistant
        </p>
      </div>
    </div>
  );
}
