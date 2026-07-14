'use client';

import { useState, useEffect } from 'react';
import { WifiOff, CheckCircle2, XCircle, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { isNFCSupported } from '@/lib/nfc';

interface EnvironmentInfo {
  isSecure: boolean;
  browserName: string;
  browserVersion: string | null;
  os: string;
  isAndroid: boolean;
  isChrome: boolean;
  chromeVersion: number | null;
  nfcSupported: boolean;
}

type StatusType = 'checking' | 'supported' | 'unsupported';

export default function EnvironmentDetector() {
  const [envInfo, setEnvInfo] = useState<EnvironmentInfo | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const info = detectEnvironment();
    setEnvInfo(info);
  }, [isClient]);

  const detectEnvironment = (): EnvironmentInfo => {
    const userAgent = navigator.userAgent;
    const isSecure = window.isSecureContext;

    let browserName = '未知浏览器';
    let browserVersion: string | null = null;
    let os = '未知系统';
    let chromeVersion: number | null = null;

    const chromeMatch = userAgent.match(/Chrome\/(\d+)/);
    if (chromeMatch) {
      browserName = 'Chrome';
      browserVersion = chromeMatch[1];
      chromeVersion = parseInt(chromeMatch[1], 10);
    } else if (userAgent.includes('Firefox')) {
      browserName = 'Firefox';
    } else if (userAgent.includes('Safari')) {
      browserName = 'Safari';
    } else if (userAgent.includes('Edge')) {
      browserName = 'Edge';
    }

    if (/Android/i.test(userAgent)) {
      os = 'Android';
    } else if (/iPhone|iPad|iPod/i.test(userAgent)) {
      os = 'iOS';
    } else if (/Windows/i.test(userAgent)) {
      os = 'Windows';
    } else if (/Mac|Macintosh/i.test(userAgent)) {
      os = 'macOS';
    } else if (/Linux/i.test(userAgent)) {
      os = 'Linux';
    }

    return {
      isSecure,
      browserName,
      browserVersion,
      os,
      isAndroid: /Android/i.test(userAgent),
      isChrome: browserName === 'Chrome',
      chromeVersion,
      nfcSupported: isNFCSupported(),
    };
  };

  const getStatus = (): { type: StatusType; text: string } => {
    if (!envInfo) return { type: 'checking', text: '检测中...' };
    if (envInfo.nfcSupported) return { type: 'supported', text: '环境支持' };
    return { type: 'unsupported', text: 'NFC 不支持' };
  };

  const status = getStatus();

  const StatusIcon = status.type === 'checking' ? WifiOff : status.type === 'supported' ? CheckCircle2 : XCircle;

  if (!isClient || !envInfo) {
    return (
      <div className="bg-card/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 mx-4 mt-4 max-w-2xl lg:mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
          <span className="text-sm text-muted-foreground">正在检测运行环境...</span>
        </div>
      </div>
    );
  }

  const allChecks = [
    {
      label: 'HTTPS 安全环境',
      passed: envInfo.isSecure,
      detail: envInfo.isSecure ? '已通过 HTTPS 访问' : '需要通过 HTTPS 访问',
    },
    {
      label: 'Android 系统',
      passed: envInfo.isAndroid,
      detail: `当前系统：${envInfo.os}`,
    },
    {
      label: 'Chrome 浏览器',
      passed: envInfo.isChrome,
      detail: `当前浏览器：${envInfo.browserName}${envInfo.browserVersion ? ` ${envInfo.browserVersion}` : ''}`,
    },
    {
      label: 'Chrome 89+',
      passed: envInfo.chromeVersion !== null && envInfo.chromeVersion >= 89,
      detail: envInfo.chromeVersion !== null ? `版本 ${envInfo.chromeVersion}` : '无法获取版本',
    },
    {
      label: 'Web NFC API',
      passed: envInfo.nfcSupported,
      detail: envInfo.nfcSupported ? '浏览器支持 Web NFC' : '浏览器不支持 Web NFC',
    },
  ];

  const failedChecks = allChecks.filter((check) => !check.passed);

  const borderColor = status.type === 'supported'
    ? 'border-l-green-500'
    : status.type === 'unsupported'
    ? 'border-l-red-500'
    : 'border-l-yellow-500';

  const iconBg = status.type === 'supported'
    ? 'bg-green-500/10'
    : status.type === 'unsupported'
    ? 'bg-red-500/10'
    : 'bg-yellow-500/10';

  const iconColor = status.type === 'supported'
    ? 'text-green-400'
    : status.type === 'unsupported'
    ? 'text-red-400'
    : 'text-yellow-400';

  const titleColor = status.type === 'supported'
    ? 'text-green-400'
    : status.type === 'unsupported'
    ? 'text-red-400'
    : 'text-yellow-400';

  return (
    <div className="mx-4 mt-4 max-w-2xl lg:mx-auto">
      <div className={`glass-card p-4 md:p-5 border-l-4 ${borderColor}`}>
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
            <StatusIcon className={`w-5 h-5 ${iconColor}`} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className={`text-base font-semibold ${titleColor}`}>
                {status.text}
              </h3>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 hover:bg-white/5 rounded-lg transition-colors"
              >
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            </div>

            <p className="text-sm text-muted-foreground mb-3">
              {status.type === 'supported'
                ? '您的设备支持 Web NFC 功能，可以正常使用'
                : status.type === 'unsupported'
                ? '您的设备或浏览器不支持 Web NFC 功能'
                : '正在检测您的运行环境...'}
            </p>

            {!isExpanded && failedChecks.length > 0 && (
              <div className="space-y-1.5">
                {failedChecks.slice(0, 2).map((check, index) => (
                  <div key={index} className="flex items-start gap-2 text-xs">
                    <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{check.detail}</span>
                  </div>
                ))}
                {failedChecks.length > 2 && (
                  <p className="text-xs text-muted-foreground">
                    还有 {failedChecks.length - 2} 项未通过...
                  </p>
                )}
              </div>
            )}

            {isExpanded && (
              <div className="space-y-3 mt-4">
                <div className="grid grid-cols-1 gap-2.5">
                  {allChecks.map((check, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-secondary/50 rounded-xl border border-white/5">
                      {check.passed ? (
                        <CheckCircle2 className="w-4.5 h-4.5 text-green-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4.5 h-4.5 text-red-400 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white">{check.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{check.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {failedChecks.length > 0 && (
                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-yellow-400 mb-2">解决步骤：</p>
                        <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal list-inside">
                          {!envInfo.isSecure && <li>确保通过 HTTPS 访问本应用</li>}
                          {!envInfo.isAndroid && <li>确认使用 Android 设备访问</li>}
                          {!envInfo.isChrome && <li>安装 Chrome 浏览器</li>}
                          {envInfo.chromeVersion !== null && envInfo.chromeVersion < 89 && (
                            <li>更新 Chrome 到 89 或更高版本</li>
                          )}
                          {!envInfo.nfcSupported && <li>在 Chrome 地址栏输入 chrome://flags 并启用实验性 Web Platform 功能</li>}
                          <li>在系统设置中开启 NFC 功能</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
