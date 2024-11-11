export function preventFlashing(){
	document.body.classList.add(localStorage.theme);
	//always reveal default content AFTER loading -- prevents flashing.
	document.getElementById('appbody').classList.remove('hidden');
	document.documentElement.classList.remove(localStorage.theme);
}
