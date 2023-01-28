import { clearCart } from "./cart.js"
import { modalDeliveryContainer, modalDeliveryForm } from "./elements.js"

export const orderController = (getCart) => {

    const checkDelivery = () => {
        if (modalDeliveryForm.format.value === 'pickup') {
            modalDeliveryForm['address-info'].classList
            .add('modal-delivery__fieldset-input_hide') 
        }

            if (modalDeliveryForm.format.value === 'delivery') {
                modalDeliveryForm['address-info'].classList
                .remove('modal-delivery__fieldset-input_hide')
        }
    }

    modalDeliveryForm.addEventListener('change', checkDelivery)

    modalDeliveryForm.addEventListener('submit', e => {
        e.preventDefault()
        const formData = new FormData(modalDeliveryForm)
        const data = Object.fromEntries(formData)
        data.order = getCart()

        fetch('https://reqres.in/api/users', {
            method: 'post',
            body: JSON.stringify(data),
        })
        .then(response => response.json())
        .then(response => {
            clearCart()

            modalDeliveryContainer.innerHTML = `
            <h2>Спасибо за заказ!</h2>
            </br>
            <h3>Номер вашего заказа ${response.id}</h3>
            `

         
            //modalDeliveryForm.reset()
            //checkDelivery()
        })
    })
}