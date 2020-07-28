

const getRequestOptions = async() => {
  const token = localStorage.getItem('tk')
  let requestOptions = {
    method: 'GET',
    headers: {'Authorization': `Bearer ${token}`},
  };
  return requestOptions
}


export {getRequestOptions}
