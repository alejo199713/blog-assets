const subNav = document.querySelector(".sub-nav");

const buttons = {
    games: "Videojuegos",
    design3d: "3D",
    graphic: "Diseño Gráfico",
    software: "Software"
};

const BLOG_URL = "https://bitacora199713.blogspot.com";

async function showCategory(label){

    subNav.classList.add("active");
    subNav.innerHTML = "Cargando...";

    try{

        const response = await fetch(`${BLOG_URL}/feeds/posts/default?alt=json`);

        const data = await response.json();

        const posts = data.feed.entry || [];

        const filtered = posts.filter(post=>{

            const tags = (post.category || []).map(t=>t.term);

            return tags.includes(label);

        });

        if(filtered.length===0){

            subNav.innerHTML = "<span>Sin entradas</span>";
            return;

        }

        subNav.innerHTML = filtered.map(post=>{

            const title = post.title.$t;
            const link = post.link.find(l=>l.rel==="alternate").href;

            return `<a href="${link}">${title}</a>`;

        }).join("");

    }catch(err){

        console.error(err);
        subNav.innerHTML = "<span>Error</span>";

    }

}

document.querySelectorAll(".main-nav a").forEach(btn=>{

    btn.addEventListener("click",e=>{

        e.preventDefault();

        const key = [...btn.classList].find(c=>buttons[c]);

        if(key){

            showCategory(buttons[key]);

        }

    });

});
