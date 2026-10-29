/*
 * Operations menu.
 * A single button opens the page of the operation selected in the list.
 */

const OPERATION_PAGES = {
    newOrder: "newOrder.html",
    viewOrders: "ordersMenu.html"
};

requireSession();
setupOperationSelector("operation", "operation-button", "menu-message", OPERATION_PAGES);
