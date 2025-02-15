<script type="module">
  // Importando os módulos do Firebase
  import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js";
  import { getDatabase, ref, get, set, update } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-database.js";
  import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js";

  // Configuração do Firebase
  const firebaseConfig = {
    apiKey: "AIzaSyBp0QRdqod_68ARBfJlDfZQBX4sg1Du_o4",
    authDomain: "socialnetwork021-fad5a.firebaseapp.com",
    databaseURL: "https://socialnetwork021-fad5a-default-rtdb.firebaseio.com",
    projectId: "socialnetwork021-fad5a",
    storageBucket: "socialnetwork021-fad5a.appspot.com",
    messagingSenderId: "1040846806964",
    appId: "1:1040846806964:web:b7b873170deeb8ed785ce1",
    measurementId: "G-0NC44RCWV6"
  };

  // Inicializa o Firebase
  const app = initializeApp(firebaseConfig);
  const database = getDatabase(app);
  const auth = getAuth(app);

  // Função para verificar se deve atualizar os dados ou usar o cache
  function shouldUpdate() {
    const lastUpdate = localStorage.getItem('lastUpdate');
    const updatesToday = localStorage.getItem('updatesToday') || 0;

    if (lastUpdate) {
      const lastUpdateDate = new Date(lastUpdate);
      const today = new Date();
      const timeDiff = today.getDate() - lastUpdateDate.getDate();
      if (timeDiff > 0) {
        // Novo dia, reiniciar contador de atualizações
        localStorage.setItem('updatesToday', 0);
      }
    }

    // Verificar se há permissões para fazer uma nova requisição
    return updatesToday < 7;
  }

  // Função para carregar as informações do usuário logado
  onAuthStateChanged(auth, user => {
    if (user) {
      // Verifica se deve usar os dados em cache ou fazer uma requisição ao Firebase
      if (shouldUpdate()) {
        // Realiza a requisição ao Firebase
        const userRef = ref(database, `users/${user.uid}/game`);
        get(userRef).then(snapshot => {
          let data = snapshot.val();
          if (data) {
            if (data.xp === undefined || data.xp === 0) {
              data.xp = 1;
              update(userRef, { xp: 1 });
            }
          } else {
            data = { xp: 1 };
            set(userRef, data);
          }

          // Atualiza a UI com os dados
          document.getElementById('xp').querySelector('span').textContent = data.xp;
          document.getElementById('xpBar').style.width = `${data.xp}%`;
          document.getElementById('xpProgress').classList.remove('hidden');
          document.getElementById('badges').querySelector('span').textContent = data.badges || 'Nenhuma';
          document.getElementById('ranking').querySelector('span').textContent = data.ranking || 0;
          document.getElementById('missionsCompleted').querySelector('span').textContent = data.missionsCompleted || 0;
          document.getElementById('memberSince').querySelector('span').textContent = formatDate(data.memberSince);
          document.getElementById('clan').querySelector('span').textContent = data.clan || 'Não pertence a nenhum';
          document.getElementById('feedbacks').querySelector('span').textContent = data.feedbacks || 0;

          // Atualiza o nome do usuário no painel
          const displayName = user.displayName || "Jogador Anônimo";
          document.getElementById('userPanel').insertAdjacentHTML('beforeend', `<div class="info"><label>Nome:</label> <span>${displayName}</span></div>`);

          // Atualiza a data da última requisição e o contador de atualizações
          localStorage.setItem('lastUpdate', new Date().toString());
          localStorage.setItem('updatesToday', (parseInt(localStorage.getItem('updatesToday')) || 0) + 1);

          // Armazena os dados no cache
          localStorage.setItem('cachedUserData', JSON.stringify(data));
        });
      } else {
        // Usa dados em cache
        const cachedData = JSON.parse(localStorage.getItem('cachedUserData'));
        if (cachedData) {
          document.getElementById('xp').querySelector('span').textContent = cachedData.xp;
          document.getElementById('xpBar').style.width = `${cachedData.xp}%`;
          document.getElementById('xpProgress').classList.remove('hidden');
          document.getElementById('badges').querySelector('span').textContent = cachedData.badges || 'Nenhuma';
          document.getElementById('ranking').querySelector('span').textContent = cachedData.ranking || 0;
          document.getElementById('missionsCompleted').querySelector('span').textContent = cachedData.missionsCompleted || 0;
          document.getElementById('memberSince').querySelector('span').textContent = formatDate(cachedData.memberSince);
          document.getElementById('clan').querySelector('span').textContent = cachedData.clan || 'Não pertence a nenhum';
          document.getElementById('feedbacks').querySelector('span').textContent = cachedData.feedbacks || 0;
        }
      }
    }
  });

  // Função para carregar o ranking global
  function loadGlobalRanking() {
    const rankingRef = ref(database, "users");

    get(rankingRef).then(snapshot => {
      if (snapshot.exists()) {
        const rankingData = [];

        snapshot.forEach(childSnapshot => {
          const userData = childSnapshot.val();
          if (userData.game) {
            rankingData.push({
              name: userData.displayName || "Jogador Anônimo",
              xp: userData.game?.xp || 0
            });
          }
        });

        rankingData.sort((a, b) => b.xp - a.xp);

        const rankingElement = document.getElementById("rankingGlobal");
        rankingElement.innerHTML = "<h2>Ranking Global</h2>";
        
        // Criando o Marquee para exibir o ranking
        const marquee = document.createElement("marquee");
        marquee.setAttribute("scrollamount", "5");  // Velocidade do scroll

        rankingData.forEach((player, index) => {
          const rankItem = document.createElement("span");
          rankItem.innerHTML = `<strong>${index + 1}º</strong> ${player.name} - XP: ${player.xp} &nbsp;&nbsp;|&nbsp;&nbsp; `;
          marquee.appendChild(rankItem);
        });

        rankingElement.appendChild(marquee);
      } else {
        console.log("Nenhum dado encontrado no Firebase.");
      }
    }).catch((error) => {
      console.log("Erro ao carregar dados do Firebase:", error);
    });
  }

  loadGlobalRanking();

  // Função para formatar a data
  function formatDate(date) {
    if (!date) return 'Não informado';
    return new Date(date).toLocaleDateString('pt-BR');
  }
</script>