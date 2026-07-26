document.addEventListener("DOMContentLoaded", () => {

    // 1. Selección de elementos principales del DOM
    const subNav = document.querySelector(".sub-nav");
    const rightColumn = document.querySelector(".right-column");
    const heroExpanded = document.querySelector(".hero-expanded");

    // Mapeo de clases de botones con las etiquetas en Blogger
    const buttons = {
        games: "Videojuegos",
        design3d: "3D",
        graphic: "Diseño Gráfico",
        software: "Software"
    };

    const BLOG_URL = "https://bitacora199713.blogspot.com";

    // Almacén temporal de las entradas cargadas para acceso rápido
    let currentPosts = [];

    /**
     * Muestra las entradas en la sub-barra de navegación según la categoría
     * @param {string} label - Categoría seleccionada
     */
    async function showCategory(label) {
        subNav.classList.add("active");
        subNav.innerHTML = "<span>Cargando datos...</span>";

        try {
            // Petición al feed JSON de Blogger
            const response = await fetch(`${BLOG_URL}/feeds/posts/default?alt=json`);
            const data = await response.json();

            // Guardamos las entradas obtenidas
            const posts = data.feed.entry || [];

            // Filtramos por la etiqueta (label) correspondiente
            const filtered = posts.filter(post => {
                const tags = (post.category || []).map(t => t.term);
                return tags.includes(label);
            });

            if (filtered.length === 0) {
                subNav.innerHTML = "<span>Sin entradas disponibles</span>";
                return;
            }

            // Guardamos las entradas filtradas globalmente para usarlas al dar clic
            currentPosts = filtered;

            // Renderizamos los enlaces en el submenú usando el índice para identificar cada post
            subNav.innerHTML = filtered.map((post, index) => {
                const title = post.title.$t;
                return `<a href="#" data-index="${index}" class="submenu-link">${title}</a>`;
            }).join("");

        } catch (err) {
            console.error("Error al obtener las entradas:", err);
            subNav.innerHTML = "<span>Error de conexión</span>";
        }
    }

    /**
     * Muestra el Hero Expandido e inyecta la información del post seleccionado
     * @param {Object} postData - Objeto con la información de la entrada
     */
    function renderExpandedPost(postData) {
        const title = postData.title.$t;
        // Obtenemos el contenido completo del post (o el resumen si no hay contenido extenso)
        const content = postData.content ? postData.content.$t : (postData.summary ? postData.summary.$t : "");

        // Inyectamos el botón 'VOLVER AL HOME' DENTRO del contenedor del post
        heroExpanded.innerHTML = `
            <div class="hero-expanded-content" id="postContainer">
                <button id="btnClosePost" class="btn-close-expanded" style="cursor:pointer; margin-bottom:15px; background:transparent; border:1px solid #00ffcc; color:#00ffcc; padding:5px 12px; font-family:inherit;">← VOLVER AL HOME</button>
                <article class="post-content">
                    <h1 style="color:#00ffcc; margin-bottom:15px;">${title}</h1>
                    <div class="post-body">${content}</div>
                </article>
            </div>
        `;

        // Activamos la vista del post mediante la clase en .right-column
        if (rightColumn) {
            rightColumn.classList.add("post-active");
        }

        // Asignamos el evento al botón de volver al Home
        document.getElementById("btnClosePost").addEventListener("click", closePost);
    }

    /**
     * Oculta el Hero Expandido, oculta el submenú y regresa a la vista inicial del Home
     */
    function closePost() {
        // 1. Desactivar vista post en la columna derecha
        if (rightColumn) {
            rightColumn.classList.remove("post-active");
        }

        // 2. Ocultar y limpiar el submenú sub-nav
        if (subNav) {
            subNav.classList.remove("active");
            subNav.innerHTML = "";
        }

        // 3. Limpiar contenido del Hero Expandido
        heroExpanded.innerHTML = "";
    }

    // 2. Escuchador de clics en la barra de navegación principal (Categorías)
    document.querySelectorAll(".main-nav a").forEach(btn => {
        btn.addEventListener("click", e => {
            e.preventDefault();
            const key = [...btn.classList].find(c => buttons[c]);
            if (key) {
                showCategory(buttons[key]);
            }
        });
    });

    // 3. Escuchador de clics en el submenú (Entradas del proyecto)
    subNav.addEventListener("click", e => {
        const item = e.target.closest(".submenu-link");
        if (!item) return;

        e.preventDefault();

        // Recuperamos el índice de la entrada almacenada
        const postIndex = item.getAttribute("data-index");
        const selectedPost = currentPosts[postIndex];

        if (selectedPost) {
            renderExpandedPost(selectedPost);
        }
    });

});
