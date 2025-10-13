import { CONFIG } from './config.js';

paypal.Buttons({
  createOrder: function(data, actions){
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let total = cart.reduce((sum,item)=>sum+item.price,0).toFixed(2);
    return actions.order.create({purchase_units:[{amount:{value:total}}]});
  },
  onApprove: function(data, actions){
    return actions.order.capture().then(()=>{
      localStorage.removeItem('cart');
      window.location.href='success.html';
    });
  }
}).render('#paypal-button-container');
