import { handleTextSelection } from "../../utils/misc/handleTextSelection.js";

export default function activateHandleTextSelection()
{
	document.addEventListener('selectionchange', handleTextSelection);
}
