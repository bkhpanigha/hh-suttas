export function preventFlashing(){
	//always reveal default content AFTER loading -- prevents flashing.
	document.getElementById('appbody').classList.remove('hidden');
}
