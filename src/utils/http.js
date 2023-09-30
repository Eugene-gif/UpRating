import { useStore } from "@/store/store";
import { Notify } from "quasar";

const METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
}

function _copy(data) {
  return JSON.parse(JSON.stringify(data));
}

async function getData(url, method, params) {
  try {
    const store = useStore();
    const token = localStorage.getItem('token');

    const headers = {
      "Content-Type": "application/json",
    };

    if (token) {
      Object.assign(headers, {'authorization': `Bearer ${token}`});
    }

    let response = await fetch(import.meta.env.VITE_API_URL + url, {
      method: method,
      headers: headers,
      body: (method === METHODS.GET ? null : JSON.stringify(params))
    });

    if (!response.ok) {
      if (response.status === 401) {
        store.logout();

        Notify.create({
          position: "bottom",
          color: 'red',
          message: 'Истекло время токена',
        });
      }
    }

    return await response.json();
  } catch (error) {
    return error;
  }
}

// Функция загрузки изображений
async function uploadImage(params) {
    const isArray = Array.isArray(params);
    const token = localStorage.getItem('token');

    const headers = {
        'Authorization': 'Bearer ' + token
    };

    if (isArray) {
      try {
        let requests = params.map(image => {
          const imageData = new FormData();
          imageData.append('attachment', image[0] ?? image);
          imageData.append('attachmentTitle', 'title');

          return fetch(import.meta.env.VITE_API_URL + '/admin/attachment/upload', {
            method: 'POST',
            headers: headers,
            body: imageData,
          })
          .catch(e => {
            console.log(e);
          });
        });

        let IDs = [];

        await Promise.all(requests)
          .then(responses => Promise.all(responses.map(r => r.json())))
          .then((responses) => {
            responses.forEach((response) => {
              IDs.push(response.id);
            });
          })
          .catch((e) => {
            console.log(e);
          });

        return IDs;
      } catch (e) {
        return e;
      }
    } else {
      try {
        const store = useStore();
        const imageData = new FormData();
        imageData.append('attachment', params);
        imageData.append('attachmentTitle', 'title');

        let response = await fetch(import.meta.env.VITE_API_URL + '/admin/attachment/upload', {
          method: 'POST',
          headers: headers,
          body: imageData,
        });

        if (!response.ok) {
          if (response.status === 401) {
            store.logout();

            Notify.create({
                position: "bottom",
                color: 'red',
                message: 'Истекло время токена',
            });

            return;
          }

          response = await response.json();

          Notify.create({
            position: "bottom",
            color: 'red',
            message: response.error,
          });

          return;
        }

        response = await response.json();

        return response.result;
      } catch (e) {
        return e;
      }
    }
}

export { getData, uploadImage, METHODS, _copy };