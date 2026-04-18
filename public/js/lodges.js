document.addEventListener("DOMContentLoaded", () => {

  // ─────────────────────────────
  // DUMMY DATA
  // ─────────────────────────────
  const LODGES = Array.from({ length: 23 }, (_, i) => ({
    id: i + 1,
    name: `Serenity Lodge ${i + 1}`,
    location: "Lekki Phase 1",
    price: 42000 + i * 1200,
    rating: (4 + Math.random()).toFixed(1),
    image: null
  }));

  // ─────────────────────────────
  // STATE
  // ─────────────────────────────
  let currentPage = 1;
  const perPage = 10;

  const grid = document.getElementById("lodges-grid");
  const empty = document.getElementById("empty");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const pageInfo = document.getElementById("pageInfo");

  const format = (n) => "₦" + Number(n).toLocaleString();

  // ─────────────────────────────
  // CARD UI (UPGRADED)
  // ─────────────────────────────
  function card(lodge) {
    return `
      <div class="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 active:scale-[0.99]">

        <!-- IMAGE -->
        <div class="relative h-48 bg-gray-100 overflow-hidden">

          <div class="absolute inset-0 flex items-center justify-center text-gray-300 text-sm">
            Image Preview
          </div>

          <!-- subtle overlay -->
          <div class="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition"></div>

          <!-- rating badge -->
          <div class="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-xs text-gray-700 shadow-sm">
            ⭐ ${lodge.rating}
          </div>

        </div>

        <!-- BODY -->
        <div class="p-5">

          <h3 class="text-lg font-semibold text-gray-900 tracking-tight">
            ${lodge.name}
          </h3>

          <p class="text-sm text-gray-500 mt-1">
            ${lodge.location}
          </p>

          <div class="flex items-center justify-between mt-4">
            <p class="text-gray-900 font-semibold text-base">
              ${format(lodge.price)}
            </p>

            <p class="text-xs text-gray-400">
              per night
            </p>
          </div>

          <button class="mt-5 w-full bg-gray-900 text-white text-sm py-2.5 rounded-xl hover:bg-gray-800 active:scale-[0.98] transition">
            View lodge
          </button>

        </div>

      </div>
    `;
  }

  // ─────────────────────────────
  // RENDER
  // ─────────────────────────────
  function render() {

    const start = (currentPage - 1) * perPage;
    const end = start + perPage;

    const pageData = LODGES.slice(start, end);

    if (pageData.length === 0) {
      grid.innerHTML = "";
      empty.classList.remove("hidden");
      return;
    }

    empty.classList.add("hidden");

    grid.innerHTML = pageData.map(card).join("");

    const totalPages = Math.ceil(LODGES.length / perPage);

    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;

    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
  }

  // ─────────────────────────────
  // EVENTS
  // ─────────────────────────────
  prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      render();
    }
  });

  nextBtn.addEventListener("click", () => {
    const totalPages = Math.ceil(LODGES.length / perPage);
    if (currentPage < totalPages) {
      currentPage++;
      render();
    }
  });

  render();
});