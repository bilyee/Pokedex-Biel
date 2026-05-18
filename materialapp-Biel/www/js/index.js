const POKEAPI_LIST = 'https://pokeapi.co/api/v2/pokemon?limit=24';
const POKE_LIMIT = 24;

const TYPE_COLORS = {
    normal: '#A8A878', fire: '#F08030', water: '#6890F0', electric: '#F8D030',
    grass: '#78C850', ice: '#98D8D8', fighting: '#C03028', poison: '#A040A0',
    ground: '#E0C068', flying: '#A890F0', psychic: '#F85888', bug: '#A8B820',
    rock: '#B8A038', ghost: '#705898', dragon: '#7038F8', dark: '#705848',
    steel: '#B8B8D0', fairy: '#EE99AC'
};

document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    console.log('Cordova ' + cordova.platformId + ' @ ' + cordova.version);
}

document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
    M.AutoInit();
    M.Sidenav.init(document.querySelectorAll('.sidenav'));
    const tabs = M.Tabs.init(document.querySelectorAll('.tabs'));

    document.querySelectorAll('.nav-tab-link').forEach(function (link) {
        link.addEventListener('click', function () {
            const target = link.getAttribute('href');
            const tabEl = document.querySelector('.tabs .tab a[href="' + target + '"]');
            if (tabEl) tabEl.click();
            const sidenav = M.Sidenav.getInstance(document.getElementById('slide-out'));
            if (sidenav) sidenav.close();
        });
    });

    document.querySelectorAll('.btn-go-pokedex').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            const tabEl = document.querySelector('.tabs .tab a[href="#tab-pokedex"]');
            if (tabEl) tabEl.click();
        });
    });

    const btnLoad = document.getElementById('load-pokemon');
    if (btnLoad) {
        btnLoad.addEventListener('click', loadPokemon);
    }
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function showStatus(message, isError) {
    const status = document.getElementById('pokemon-status');
    if (!status) return;
    status.classList.remove('hide');
    status.innerHTML = isError
        ? '<p class="red-text"><i class="material-icons tiny">error</i> ' + message + '</p>'
        : '<div class="preloader-wrapper small active"><div class="spinner-layer spinner-red-only"><div class="circle-clipper left"><div class="circle"></div></div><div class="circle-clipper right"><div class="circle"></div></div></div></div><p class="grey-text">' + message + '</p>';
}

function hideStatus() {
    const status = document.getElementById('pokemon-status');
    if (status) status.classList.add('hide');
}

function getSpriteUrl(pokemon) {
    const official = pokemon.sprites.other && pokemon.sprites.other['official-artwork'];
    return (official && official.front_default) || pokemon.sprites.front_default || '';
}

function createTypeChips(types) {
    return types.map(function (t) {
        const name = t.type.name;
        const color = TYPE_COLORS[name] || '#9E9E9E';
        return '<span class="type-chip" style="background-color:' + color + '">' + capitalize(name) + '</span>';
    }).join('');
}

function createPokemonCard(pokemon) {
    const col = document.createElement('div');
    col.className = 'col s12 m6 l4';

    const name = capitalize(pokemon.name);
    const id = String(pokemon.id).padStart(3, '0');
    const sprite = getSpriteUrl(pokemon);
    const heightM = (pokemon.height / 10).toFixed(1);
    const weightKg = (pokemon.weight / 10).toFixed(1);
    const types = createTypeChips(pokemon.types);

    col.innerHTML =
        '<div class="card pokemon-card hoverable z-depth-2">' +
            '<div class="card-image pokemon-image">' +
                '<img src="' + sprite + '" alt="' + name + '" loading="lazy" onerror="this.src=\'img/logo.png\'">' +
                '<span class="pokemon-id">#' + id + '</span>' +
            '</div>' +
            '<div class="card-content">' +
                '<span class="card-title">' + name + '</span>' +
                '<div class="type-chips">' + types + '</div>' +
                '<p class="pokemon-stats"><i class="material-icons tiny">height</i> ' + heightM + ' m &nbsp; ' +
                '<i class="material-icons tiny">fitness_center</i> ' + weightKg + ' kg</p>' +
            '</div>' +
        '</div>';

    return col;
}

async function loadPokemon() {
    const listEl = document.getElementById('pokemon-list');
    const btn = document.getElementById('load-pokemon');
    if (!listEl) return;

    showStatus('Cargando Pokémon...', false);
    listEl.innerHTML = '';
    if (btn) btn.disabled = true;

    try {
        const listRes = await fetch(POKEAPI_LIST);
        if (!listRes.ok) throw new Error('HTTP ' + listRes.status);
        const listData = await listRes.json();

        const urls = listData.results.slice(0, POKE_LIMIT).map(function (p) { return p.url; });
        const details = await Promise.all(
            urls.map(function (url) {
                return fetch(url).then(function (r) {
                    if (!r.ok) throw new Error('Error al obtener ' + url);
                    return r.json();
                });
            })
        );

        hideStatus();
        details.forEach(function (pokemon) {
            listEl.appendChild(createPokemonCard(pokemon));
        });
    } catch (err) {
        showStatus('No se pudieron cargar los Pokémon. Comprueba tu conexión. (' + err.message + ')', true);
        console.error(err);
    } finally {
        if (btn) btn.disabled = false;
    }
}
