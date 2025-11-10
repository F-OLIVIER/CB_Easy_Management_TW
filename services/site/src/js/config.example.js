// https://discordjs.guide/oauth2/#setting-up-a-basic-web-server
export const cookieName = "name_cookie";
export const domain = "localhost";
export const LINK_INVITE_BOT = "";
export const LINK_DISCORD = "https://discord.com/oauth2/authorize?client_id=123456&response_type=token&redirect_uri=adresse_redirect"
export const adressAPI = "http://localhost/api/";

// Gestion des versions JS
export const versionJS = "?v=20250817";
export async function loadModule(name) {
    return await import(`./${name}${versionJS}`);
}
