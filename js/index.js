import { catalogList, modalProduct} from "./elements.js"

import { renderProductList } from "./renderProductList.js"


catalogList.addEventListener('click', (event) => {
    const target = event.target

    if (target.closest('.product__detail') || target.closest('.product__image')) {
        modalProduct.classList.add('modal_open')
    }
})

modalProduct.addEventListener('click', (event) => {
    const target = event.target

    if (target.closest('.modal__close') || target === modalProduct) {
        modalProduct.classList.remove('modal_open')
    }
})

const init = () => {
    renderProductList()
}

init()