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
