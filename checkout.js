let currentStep = 1;
const totalSteps = 4;
const steps = document.querySelectorAll('.step');
const stepContents = document.querySelectorAll('.step-content');
const nextButtons = document.querySelectorAll('.next-step-btn');
const cartTableBody = document.querySelector('.cart-table tbody');

function renderCart() {
    if(!cartTableBody) return;
    cartTableBody.innerHTML = '';
    cart.forEach(item=>{
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${item.name}</td>
                        <td>$${item.price}</td>
                        <td><input type="number" value="${item.qty}" min="1" class="qty-input"></td>
                        <td class="total-price">$${(item.price*item.qty).toFixed(2)}</td>
                        <td><button class="remove-item">X</button></td>`;
        cartTableBody.appendChild(tr);
    });
    attachCartEvents();
}
renderCart();

function attachCartEvents(){
    const qtyInputs = document.querySelectorAll('.qty-input');
    const removeButtons = document.querySelectorAll('.remove-item');
    qtyInputs.forEach((input,index)=>{
        input.addEventListener('input',()=>{
            cart[index].qty = parseInt(input.value);
            saveCart();
            renderCart();
        });
    });
    removeButtons.forEach((btn,index)=>{
        btn.addEventListener('click',()=>{
            cart.splice(index,1);
            saveCart();
            renderCart();
        });
    });
}

/* Step Navigation */
nextButtons.forEach(btn=>{
    btn.addEventListener('click',()=>{
        stepContents[currentStep-1].style.display='none';
        steps[currentStep-1].classList.remove('active');
        currentStep++;
        if(currentStep>totalSteps) currentStep=totalSteps;
        stepContents[currentStep-1].style.display='block';
        steps[currentStep-1].classList.add('active');
    });
});

const orderNumElem = document.getElementById('order-number');
if(orderNumElem) orderNumElem.innerText = '#'+Math.floor(Math.random()*90000+10000);
