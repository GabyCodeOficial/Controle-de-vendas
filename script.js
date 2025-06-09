document.addEventListener("DOMContentLoaded", async () => {
    const productList = document.getElementById("productList");
    const purchaseForm = document.getElementById("purchaseForm");

    // Função assíncrona para buscar produtos do servidor
    async function fetchProducts() {
        try {
            const response = await fetch("http://localhost:3000/products");
            if (!response.ok) throw new Error("Erro ao buscar produtos!");
            const products = await response.json();

            products.forEach(product => {
                const item = document.createElement("li");
                item.textContent = `${product.name} - R$ ${product.price} (Estoque: ${product.stock})`;
                productList.appendChild(item);
            });
        } catch (error) {
            console.error(error.message);
        }
    }

    // Função assíncrona para registrar uma compra
    async function registerPurchase(event) {
        event.preventDefault();
        const productCode = document.getElementById("productCode").value;
        const quantity = document.getElementById("quantity").value;

        try {
            const response = await fetch("http://localhost:3000/purchase", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: productCode, quantity: quantity })
            });

            const result = await response.json();
            alert(result.message);
        } catch (error) {
            console.error("Erro ao registrar compra:", error);
        }
    }

    // Carregar produtos automaticamente ao carregar a página
    await fetchProducts();

    // Adicionar evento de compra ao formulário
    purchaseForm.addEventListener("submit", registerPurchase);
});
