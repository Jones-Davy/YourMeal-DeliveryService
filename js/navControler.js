import { navigationList, navigationButtons, catalogTitle  } from "./elements.js"
export const navControler = (callback) => {
    navigationList.addEventListener('click', e => {
        const categoryButton = e.target.closest('.navigation__button')

        if(!categoryButton) return;
        navigationButtons.forEach(item => {
            if(item === categoryButton) {
                item.classList.add('navigation__button_active')
                catalogTitle.textContent = item.textContent
                callback(item.dataset.category)
            } else {
                item.classList.remove('navigation__button_active')

            }
        })
    })
}