import type { Location } from './types';

export function getBrowser() {
  if (typeof navigator === 'undefined') {
    return undefined;
  }

  const userAgent = navigator.userAgent;
  let name = 'Desconocido';
  let version = '';

  if (userAgent.indexOf("Chrome") > -1 && userAgent.indexOf("Edg") === -1 && userAgent.indexOf("OPR") === -1) {
    name = 'Chrome';
    version = (userAgent.match(/Chrome\/([0-9.]+)/) || [])[1] || '';
  } else if (userAgent.indexOf("Firefox") > -1) {
    name = 'Firefox';
    version = (userAgent.match(/Firefox\/([0-9.]+)/) || [])[1] || '';
  } else if (userAgent.indexOf("Safari") > -1 && userAgent.indexOf("Chrome") === -1 && userAgent.indexOf("OPR") === -1) {
    name = 'Safari';
    version = (userAgent.match(/Version\/([0-9.]+)/) || [])[1] || '';
  } else if (userAgent.indexOf("Edg") > -1) {
    name = 'Edge';
    version = (userAgent.match(/Edg\/([0-9.]+)/) || [])[1] || '';
  } else if (userAgent.indexOf("OPR") > -1) {
    name = 'Opera';
    version = (userAgent.match(/OPR\/([0-9.]+)/) || [])[1] || '';
  } else if (userAgent.indexOf("MSIE") > -1 || userAgent.indexOf("Trident/") > -1) {
    name = 'Internet Explorer';
    version = (userAgent.match(/(MSIE |rv:)([0-9.]+)/) || [])[2] || '';
  }

  return { name, version, userAgent };
}

export async function getMyIP() {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Error fetching IP:', error);
    return null;
  }
}

export async function getMyLocation(ip: string): Promise<Location | null> {
  try {
    const response = await fetch(`https://ip.guide/${ip}`);
    const data = await response.json();
    return data?.location ?? null;
  } catch (error) {
    console.error('Error fetching location:', error);
    return null;
  }
}
