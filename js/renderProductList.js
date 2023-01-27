import { API_URL, PREFIX_PRODUCT } from "./const.js"
import createCardProduct from "./createCardProduct.js"
import { getData } from "./getData.js"
import { catalogList } from "./elements.js"


export const renderProductList = async (category = 'burger') => {
    catalogList.textContent = ''
    const listProduct = await getData(`${API_URL}` + `${PREFIX_PRODUCT}?category=${category}`)
    const listCard = listProduct.map(createCardProduct)
    catalogList.append(...listCard)
}