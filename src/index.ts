//declaring variables
const searchButton = document.getElementById(`clickMe`) as HTMLButtonElement;
const searchInput = document.getElementById(`inputField`) as HTMLInputElement;
const results = document.getElementById(`results`) as HTMLElement;
const url = "http://localhost:5050/fibonacci/";
const resultsUrl = "http://localhost:5050/getFibonacciResults";
const _alert = document.getElementById("alert") as HTMLElement;
const prevResults = document.getElementById(`prevResults`) as HTMLElement;
const isSelected = document.getElementById(
  "save-calculation"
) as HTMLInputElement;
const sortResults = document.getElementById("sortResults") as HTMLSelectElement;
const resultsTitle = document.getElementById("results-title") as HTMLElement;
interface Storage {
  number: number;
  result: number;
  _id: string;
}

let resultsData: Storage[] = [];
const loader = document.createElement("div");

loader.classList.add("spinner-border");
loader.innerHTML = "<span class='visually-hidden'>Loading...</span>";

//found this as a less "expensive" way of calculating recursive fibonacci recursivley on the web
function fibonacci(num: number, memo: Record<number, number> = {}): number {
  if (memo[num]) return memo[num];
  if (num <= 2) return 1;
  return (memo[num] = fibonacci(num - 1, memo) + fibonacci(num - 2, memo));
}

//fetch url taking number as a parameter
const fibServer = async (number: number) => {
  try {
    const response = await fetch(`${url}${number}`);
    if (response.status === 400) {
      //finding the alert with the text for status 400
      const data = await response.text();
      results.style.textDecoration = "none";
      results.innerHTML = `<p style="color:red;font-weight:100;">Server Error:${data}</p>`;
      return;
    }
    const data = await response.json();
    results.innerHTML = data.result;
  } catch (error) {
    console.log(error);
  }
};
//calling and injecting fib calc either from server or from function or error if asked in assignment
const displayFib = async (e: MouseEvent) => {
  e.preventDefault();
  _alert.classList.add("d-none");
  searchInput.classList.remove("border-danger", "text-danger", "is-invalid");
  let number = parseInt(searchInput.value);
  results.style.textDecoration = `underline`;
  if (number > 50) {
    results.innerHTML = "";
    //make these alerts in a box under input box as shown in figma
    searchInput.classList.add("border-danger", "text-danger", "is-invalid");
    _alert.innerHTML = "number is bigger than 50";
    _alert.classList.remove("d-none");
    _alert.classList.add("d-block");
    return;
  }
  if (number == 42) {
    results.style.textDecoration = "none";
    return (results.innerHTML = `<p style="color:red;font-weight:100;">Server Error:42 is the meaning of life.</p>`);
  }
  if (number < 1) {
    results.innerHTML = "";
    searchInput.classList.add("border-danger", "text-danger", "is-invalid");
    _alert.innerHTML = "number is smaller than 1";
    _alert.classList.remove("d-none");
    _alert.classList.add("d-block");
    return;
  } //add conditional to call either the fetch or the fib function based on checkbox being checked or not
  if (isSelected.checked) {
    await fibServer(number);
    previousFib();
    resetSelectElement();
  } else {
    results.innerHTML = fibonacci(number).toString();
  }
};
//history fetch
const previousFib = async () => {
  resultsTitle.appendChild(loader);
  const response = await fetch(resultsUrl);
  const data = await response.json();
  resultsData = data.results;
  console.log();
  // resultsData = resultsData.slice(resultsData.length - 15, resultsData.length);
  console.log(resultsData);
  return showPrevious(resultsData);
};
//get result date and number inject into drop down list showing previous fetchs
const showPrevious = (dataResults: Storage[]) => {
  prevResults.innerHTML = "";
  for (let i = 0; i < 15; i++) {
    const p = document.createElement("p");
    p.innerHTML = `The Fibonacci of <strong>${
      dataResults[i].number
    }</strong> is <strong>${
      dataResults[i].result
    }</strong>. Calculated at date ${new Date(dataResults[i].createdDate)}`;
    const hr = document.createElement("hr");
    prevResults.appendChild(p);
    prevResults.appendChild(hr);
  }
  if (resultsTitle.childNodes.length > 3) {
    resultsTitle.removeChild(loader);
  }
};
const selectedOption = (e: Event) => {
  e.preventDefault();
  const { value } = e.target as HTMLInputElement;
  switch (value) {
    case "na":
      resultsData.sort((a, b) => a.number - b.number);
      showPrevious(resultsData);
      break;
    case "nd":
      resultsData.sort((a, b) => b.number - a.number);
      showPrevious(resultsData);
      break;
    case "da":
      resultsData.sort((a, b) => (a.createdDate > b.createdDate ? 1 : -1));
      showPrevious(resultsData);
      break;
    case "ds":
      resultsData.sort((a, b) => (a.createdDate < b.createdDate ? 1 : -1));
      showPrevious(resultsData);
      break;
    default:
      showPrevious(resultsData);
      break;
  }
};
function resetSelectElement() {
  sortResults.selectedIndex = 0;
}
searchButton.addEventListener("click", displayFib);
sortResults.addEventListener("change", selectedOption);
previousFib();
