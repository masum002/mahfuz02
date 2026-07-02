/**
 * Robust SPA navigation helper for path-based multi-page routing.
 * Updates the browser's URL pathname using pushState and triggers a popstate event
 * so that React routes/views can respond immediately without a page refresh.
 */
export const navigateTo = (path: string) => {
  // Update state and URL
  window.history.pushState({}, '', path);
  
  // Dispatch popstate event to trigger router listeners
  window.dispatchEvent(new PopStateEvent('popstate'));
  
  // Scroll to top instantly or smoothly
  window.scrollTo({ top: 0, behavior: 'instant' });
};
