const FONNTE_API_URL = 'https://api.fonnte.com/send';

export const sendFonnteWhatsApp = async (target, message) => {
  const token = import.meta.env.VITE_FONNTE_TOKEN;
  
  if (!token) {
    console.warn('VITE_FONNTE_TOKEN belum diatur di .env');
    return false;
  }

  if (!target) {
    console.warn('Nomor target (target) tidak tersedia');
    return false;
  }

  try {
    const formData = new FormData();
    formData.append('target', target);
    formData.append('message', message);
    formData.append('countryCode', '62'); // Standar Indonesia

    const response = await fetch(FONNTE_API_URL, {
      method: 'POST',
      headers: {
        Authorization: token,
      },
      body: formData,
    });

    const result = await response.json();
    if (result.status) {
      console.log('WhatsApp message sent successfully:', result);
      return true;
    } else {
      console.error('Failed to send WhatsApp message via Fonnte:', result);
      return false;
    }
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return false;
  }
};
