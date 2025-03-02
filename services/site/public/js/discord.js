import { adressAPI } from "./config.js";

// récupération des tokens
const fragment = new URLSearchParams(window.location.hash.slice(1));
const [accessToken, tokenType] = [fragment.get('access_token'), fragment.get('token_type')];
let secretsUser = `${tokenType} ${accessToken}`;

// récupération des data sur l'api discord
fetch('https://discord.com/api/users/@me', {
    headers: {
        authorization: `${secretsUser}`,
    },
})
    .then(result => result.json())
    .then(response => {
        const { username, id } = response;
        // envoie des informations au serveur
        checkid(id, username);
    })
    .catch(console.error);

function checkid(id, username) {
    // récupération des information saisie deans le formulaire
    const dataToSend = { id, username };

    fetch(adressAPI + 'discord', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erreur de réseau: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (typeof data === 'object') {
                // console.log('Data received (Register):', data);
                if (data.Redirect !== "") {
                    window.location.href = data.Gestion.Redirect;
                }
            } else {
                throw new Error('Réponse invalide du serveur (non-JSON)');
            }
        })
        .catch(error => {
            console.error('Erreur lors de la récupération des données:', error);
        });
}