export const getToken =() => {
    if(typeof window === 'undefined') return null;

    return localStorage.getItem('token');
}

export const isAuthenticated = () => {
    return !!getToken();
}


export const logout = () =>{
    localStorage.removeItem('token');
    window.location.href = '/login';
}