// PayPal Buttons integration
let cart = JSON.parse(localStorage.getItem('pusyBaliCart')) || [];

const totalEl = document.getElementById('checkout-total');
if (totalEl) totalEl.textContent = cart.reduce((sum, item) => sum + item.price*item.quantity,0).toFixed(2);

const cartItemsContainer = document.getElementById('cart-items');
if (cartItemsContainer) {
    cart.forEach(item => {
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `<img src="${item.image}" alt="${item.name}" width="50">
                         <span>${item.name} x ${item.quantity}</span>
                         <span>$${(item.price*item.quantity).toFixed(2)}</span>`;
        cartItemsContainer.appendChild(div);
    });
}

// PayPal Button render
if (document.getElementById('paypal-button-container')) {
    paypal.Buttons({
        createOrder: function(data, actions) {
            return actions.order.create({
                purchase_units: [{
                    amount: { value: cart.reduce((sum,item)=>sum+item.price*item.quantity,0).toFixed(2) }
                }]
            });
        },
        onApprove: function(data, actions) {
            return actions.order.capture().then(function(details){
                alert('Transaction completed by ' + details.payer.name.given_name);
                localStorage.removeItem('pusyBaliCart');
                window.location.href = 'index.html';
            });
        }
    }).render('#paypal-button-container');
}
import { loadScript } from "https://www.paypal.com/sdk/js";

const checkoutContainer = document.getElementById("paypal-button-container");
const cartItems = JSON.parse(localStorage.getItem("pusyCart")) || [];
const totalAmount = cartItems.reduce((sum,item)=>sum+item.price,0).toFixed(2);
document.getElementById("checkout-total").textContent = totalAmount;

paypal.Buttons({
    createOrder: function(data, actions) {
      return actions.order.create({
        purchase_units: [{
          amount: { value: totalAmount }
        }]
      });
    },
    onApprove: function(data, actions) {
      return actions.order.capture().then(function(details) {
        alert("Transaction completed by " + details.payer.name.given_name);
        localStorage.removeItem("pusyCart");
        window.location.href = "index.html";
      });
    }
}).render("#paypal-button-container");
