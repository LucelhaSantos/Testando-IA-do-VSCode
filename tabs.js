(function(){
  'use strict';

  /**
   * initTabs - inicializa um sistema de abas.
   * @param {string} buttonSelector - seletor para os botões/tab controls
   * @param {string} panelSelector - seletor para os painéis/divs de conteúdo
   * @param {string} hiddenClass - classe CSS usada para esconder (padrão: 'hidden')
   * @param {string} activeButtonClass - classe aplicada ao botão ativo (opcional)
   *
   * Comportamento:
   * - Cada botão pode ter um atributo data-target com o id do painel correspondente.
   * - Se data-target não existir, a correspondência será feita pela ordem (índice) dos elementos.
   * - A função adiciona listeners de click que mostram apenas o painel correspondente
   *   e adicionam/removem a classe fornecida.
   */
  function initTabs(buttonSelector, panelSelector, hiddenClass = 'hidden', activeButtonClass = 'active'){
    const buttons = Array.from(document.querySelectorAll(buttonSelector));
    const panels = Array.from(document.querySelectorAll(panelSelector));

    if(!buttons.length || !panels.length) return; // nada a fazer

    function hideAll(){
      panels.forEach(p => p.classList.add(hiddenClass));
      buttons.forEach(b => b.classList.remove(activeButtonClass));
    }

    buttons.forEach((btn, idx) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = btn.dataset.target;
        hideAll();
        let panel = null;
        if(targetId){
          panel = document.getElementById(targetId);
        } else {
          panel = panels[idx];
        }
        if(panel){
          panel.classList.remove(hiddenClass);
        }
        btn.classList.add(activeButtonClass);
      });
    });

    // Mostrar o primeiro por padrão
    hideAll();
    const firstBtn = buttons[0];
    if(firstBtn){
      const firstTarget = firstBtn.dataset.target;
      const firstPanel = firstTarget ? document.getElementById(firstTarget) : panels[0];
      if(firstPanel) firstPanel.classList.remove(hiddenClass);
      firstBtn.classList.add(activeButtonClass);
    }

    // Expor para uso manual caso queira inicializar com seletores diferentes
    window.initTabs = initTabs;
    return initTabs;
  }

  // Inicialização automática com classes padrões: .tab-btn e .tab-panel
  document.addEventListener('DOMContentLoaded', () => {
    initTabs('.tab-btn', '.tab-panel');
    // Inicializa também os botões de navegação que controlam as seções principais
    // (substituímos as âncoras por botões com class .nav-tab-btn e data-target com o id da seção)
    initTabs('.nav-tab-btn', '#produtos, #sobre, #depoimentos, #contato');
  });

})();
document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.nav-tab-btn');
    const sections = document.querySelectorAll('section');

    // Função para mostrar apenas a aba selecionada
    function showTab(targetId) {
        sections.forEach(section => {
            if (section.id === targetId) {
                section.classList.remove('section-hidden');
            } else {
                section.classList.add('section-hidden');
            }
        });
    }

    // Adiciona o evento de clique em cada link/botão do menu
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault(); // Impede a página de pular
            
            const targetId = tab.getAttribute('data-target');
            showTab(targetId);

            // Opcional: muda o visual do botão clicado
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });

    // Mostrar a primeira aba (Produtos) por padrão ao carregar a página
    showTab('produtos');
});