// src/utils/userInfo.ts
export const getUserInfo = () => ({
  userName: localStorage.getItem("userName"),
});

export const setUserInfo = (userName: string) => {
  localStorage.setItem("userName", userName);
};
