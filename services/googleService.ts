import { Song } from '../types';

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

// TODO: Replace this with your actual Google Client ID from Google Cloud Console
export const GOOGLE_CLIENT_ID = 'YOUR_CLIENT_ID_HERE';

const SCOPES = 'https://www.googleapis.com/auth/drive.file';
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];

let tokenClient: any;
let gapiInited = false;
let gisInited = false;
let accessToken: string | null = null;

export const initGoogleScripts = (
  clientId: string,
  onInit: () => void,
  onError: (msg: string) => void
) => {
  const gapiLoaded = () => {
    window.gapi.load('client', async () => {
      try {
        await window.gapi.client.init({
          clientId: clientId,
          discoveryDocs: DISCOVERY_DOCS,
        });
        gapiInited = true;
        if (gisInited) onInit();
      } catch (err: any) {
        console.error("GAPI Init Error", err);
        onError(JSON.stringify(err.result || err));
      }
    });
  };

  const gisLoaded = () => {
    try {
      tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: SCOPES,
        callback: (resp: any) => {
          if (resp.error !== undefined) {
            throw resp;
          }
          accessToken = resp.access_token;
        },
      });
      gisInited = true;
      if (gapiInited) onInit();
    } catch (err: any) {
       console.error("GIS Init Error", err);
       onError(err.message || "Failed to initialize Google Identity Services");
    }
  };

  if (window.gapi) gapiLoaded();
  if (window.google) gisLoaded();
};

export const handleLogin = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!tokenClient) return reject("Google Sign In not initialized. Check your network or Client ID.");
    
    // Override callback to capture token
    tokenClient.callback = (resp: any) => {
      if (resp.error) {
        reject(resp);
      }
      accessToken = resp.access_token;
      resolve(resp.access_token);
    };

    // Prompt for login
    if (accessToken === null) {
      tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
      tokenClient.requestAccessToken({ prompt: '' });
    }
  });
};

export const checkAndCreateFolder = async (folderName: string = 'SchoolMusic'): Promise<string> => {
  try {
    const response = await window.gapi.client.drive.files.list({
      q: `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`,
      fields: 'files(id, name)',
      spaces: 'drive',
    });

    const files = response.result.files;
    if (files && files.length > 0) {
      return files[0].id;
    } else {
      // Create folder
      const fileMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
      };
      const createResponse = await window.gapi.client.drive.files.create({
        resource: fileMetadata,
        fields: 'id',
      });
      return createResponse.result.id;
    }
  } catch (err) {
    console.error('Error finding/creating folder', err);
    throw err;
  }
};

export const listSongs = async (folderId: string): Promise<Song[]> => {
  try {
    // List MP3 files inside the folder
    const response = await window.gapi.client.drive.files.list({
      q: `'${folderId}' in parents and (mimeType='audio/mpeg' or mimeType='audio/mp3') and trashed=false`,
      fields: 'files(id, name, size, mimeType, createdTime)',
      pageSize: 1000,
    });

    const files = response.result.files || [];
    return files.map((f: any) => ({
      id: f.id,
      name: f.name,
      size: f.size,
      mimeType: f.mimeType,
      createdTime: f.createdTime,
    }));
  } catch (err) {
    console.error('Error listing songs', err);
    throw err;
  }
};

export const fetchFileBlob = async (fileId: string): Promise<Blob> => {
  if (!accessToken) throw new Error("No access token available");
  
  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch file: ${response.statusText}`);
  }
  
  return await response.blob();
};

export const uploadFile = async (folderId: string, file: File): Promise<void> => {
  if (!accessToken) throw new Error("No access token available");

  const metadata = {
    name: file.name,
    parents: [folderId],
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', file);

  const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
    body: form,
  });

  if (!response.ok) {
    throw new Error('Upload failed');
  }
};