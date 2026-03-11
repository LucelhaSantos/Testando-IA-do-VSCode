
// Mini carrinho simples - armazena em localStorage e renderiza no elemento #cart
(function(){
  const CART_KEY = 'esoteric_cart_v1';

  function loadCart(){
    try{
      const raw = localStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : [];
    }catch(e){
      console.error('Falha ao ler o carrinho', e);
      return [];
    }
  }

  function saveCart(cart){
    try{
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    }catch(e){
      console.error('Falha ao salvar o carrinho', e);
    }
  }

  function findItem(cart, id){
    return cart.find(i => i.id === id);
  }

  function addToCart(item){
    const cart = loadCart();
    const existing = findItem(cart, item.id);
    if(existing){
      existing.qty += item.qty;
    }else{
      cart.push(item);
    }
    saveCart(cart);
    renderCart();
  }

  function removeFromCart(id){
    let cart = loadCart();
    cart = cart.filter(i => i.id !== id);
    saveCart(cart);
    renderCart();
  }

  function updateQty(id, qty){
    const cart = loadCart();
    const item = findItem(cart, id);
    if(!item) return;
    item.qty = qty > 0 ? qty : 0;
    saveCart(cart.filter(i => i.qty > 0));
    renderCart();
  }

  function getTotal(cart){
    return cart.reduce((sum, it) => sum + (it.price * it.qty), 0);
  }

  function formatPrice(num){
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function parsePriceFromText(txt){
    if(!txt) return 0;
    const m = txt.replace(/\./g,'').replace(',','.') .match(/([0-9]+(\.[0-9]+)?)/);
    if(!m) return 0;
    return parseFloat(m[0]);
  }

  // Renderiza o carrinho no elemento #cart
  function renderCart(){
    const container = document.getElementById('cart');
    if(!container) return;
    const cart = loadCart();
    container.innerHTML = '';

    const title = document.createElement('h2');
    title.textContent = 'Carrinho';
    container.appendChild(title);

    if(cart.length === 0){
      const p = document.createElement('p');
      p.textContent = 'Seu carrinho está vazio.';
      container.appendChild(p);
      return;
    }

    const list = document.createElement('ul');
    list.style.listStyle = 'none';
    list.style.padding = '0';
    list.style.margin = '0 0 0.5rem 0';

    cart.forEach(item => {
      const li = document.createElement('li');
      li.style.borderBottom = '1px solid rgba(0,0,0,0.06)';
      li.style.padding = '0.5rem 0';

      const name = document.createElement('div');
      name.textContent = item.name;
      name.style.fontWeight = '600';
      li.appendChild(name);

      const meta = document.createElement('div');
      meta.style.display = 'flex';
      meta.style.gap = '0.5rem';
      meta.style.alignItems = 'center';

      const qty = document.createElement('input');
      qty.type = 'number';
      qty.min = '1';
      qty.value = item.qty;
      qty.style.width = '4rem';
      qty.dataset.id = item.id;
      qty.addEventListener('change', (e) => {
        const v = parseInt(e.target.value, 10) || 1;
        updateQty(item.id, v);
      });

      const price = document.createElement('div');
      price.textContent = formatPrice(item.price);
      price.style.marginLeft = 'auto';

      const remove = document.createElement('button');
      remove.type = 'button';
      remove.textContent = 'Remover';
      remove.dataset.id = item.id;
      remove.addEventListener('click', () => removeFromCart(item.id));

      meta.appendChild(qty);
      meta.appendChild(remove);
      meta.appendChild(price);
      li.appendChild(meta);
      list.appendChild(li);
    });

    container.appendChild(list);

    const totalDiv = document.createElement('div');
    totalDiv.style.display = 'flex';
    totalDiv.style.justifyContent = 'space-between';
    totalDiv.style.alignItems = 'center';
    totalDiv.style.marginTop = '0.5rem';

    const totalLabel = document.createElement('strong');
    totalLabel.textContent = 'Total';
    const totalValue = document.createElement('div');
    totalValue.textContent = formatPrice(getTotal(cart));

    totalDiv.appendChild(totalLabel);
    totalDiv.appendChild(totalValue);
    container.appendChild(totalDiv);

    const actions = document.createElement('div');
    actions.style.display = 'flex';
    actions.style.gap = '0.5rem';
    actions.style.marginTop = '0.5rem';

    const clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.textContent = 'Limpar carrinho';
    clearBtn.addEventListener('click', () => { localStorage.removeItem(CART_KEY); renderCart(); });

    const checkoutBtn = document.createElement('button');
    checkoutBtn.type = 'button';
    checkoutBtn.textContent = 'Finalizar compra';
    checkoutBtn.addEventListener('click', () => {
      // Implementação simples: apenas mostra resumo e limpa carrinho
      alert('Resumo do pedido:\n' + cart.map(i => `${i.name} x${i.qty} — ${formatPrice(i.price*i.qty)}`).join('\n') + '\n\nTotal: ' + formatPrice(getTotal(cart)));
      localStorage.removeItem(CART_KEY);
      renderCart();
    });

    actions.appendChild(clearBtn);
    actions.appendChild(checkoutBtn);
    container.appendChild(actions);
  }

  // Intercepta os formulários de produto para adicionar ao carrinho
  function wireProductForms(){
    const forms = document.querySelectorAll('section#produtos form');
    forms.forEach(form => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const article = form.closest('article');
        if(!article) return;
        const id = article.id || (article.querySelector('h3')?.textContent || '').trim();
        const name = article.querySelector('h3')?.textContent?.trim() || 'Produto';

        // tenta encontrar o parágrafo com preço (texto que contém 'Preço')
        let price = 0;
        const paragraphs = Array.from(article.querySelectorAll('p'));
        const pprice = paragraphs.find(p => /Preço/i.test(p.textContent));
        if(pprice) price = parsePriceFromText(pprice.textContent);

        const qtyInput = form.querySelector('input[type="number"]');
        const qty = qtyInput ? (parseInt(qtyInput.value, 10) || 1) : 1;

        addToCart({ id, name, price, qty });
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    wireProductForms();
    renderCart();
  });

})();
