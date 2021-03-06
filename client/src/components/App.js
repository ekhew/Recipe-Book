import styles from "../styles/App.module.css";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Axios from "axios";
import Collapsible from "./Collapsible";
import Filter from "./Filter";

//main page
function App() {
  //'App' function component states used to store user input
  const [showList, setShowList] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [filteredCategories, setFilteredCategories] = useState([]); //is modified by the 'Filter' component

  //shows filtered list of dishes
  useEffect(() => {
    //only send a request if the array is not empty (at least one category selected)
    if (filteredCategories.length !== 0) {
      const queryString = filteredCategories.join("|") + "?"; //convert the array into a regular expression (REGEXP) that can be used in the query on the server side
      Axios.get("http://localhost:3001/get-filtered", {
        params: { filteredCategories: queryString },
      }).then((response) => {
        setShowList(response.data);
      });
    }
  }, [filteredCategories]);

  //displays all dishes on mount (when the page renders for the first time)
  useEffect(() => {
    getAllDishes();
  }, []);

  //read; get request; display all dishes
  const getAllDishes = () => {
    Axios.get("http://localhost:3001/get-all").then((response) => {
      setShowList(response.data);
    });
  };

  //read; get request; display searched dishes
  const searchDishes = (name) => {
    //only search when there is user input
    if (name !== "") {
      Axios.get(`http://localhost:3001/search/${name}`).then((response) => {
        setShowList(response.data);
      });
    }
  };

  //delete; delete request; delete a dish
  const deleteDish = (id) => {
    //pop-up asking the user to confirm deletion of dish
    const confirm = window.confirm(
      "Are you sure you want to delete this dish?"
    );
    //only proceed to delete dish if the user confirmed
    if (confirm) {
      Axios.delete(`http://localhost:3001/delete/${id}`).then(() => {
        setShowList(
          showList.filter((val) => {
            return val.id !== id;
          })
        );
      });
    }
  };

  //render component into browser
  return (
    <div className={styles.App}>
      <div id={styles.topContainer}>
        <Link to="/Create">
          <button className={styles.addBtn}>Create New</button>
        </Link>
        <Filter
          title="Filter Dishes"
          setFilteredCategories={setFilteredCategories}
        ></Filter>
        <div className={styles.searchSection}>
          <input
            type="text"
            placeholder="Search here"
            onChange={(event) => {
              setSearchName(event.target.value);
            }}
          />
          <button onClick={() => searchDishes(searchName)}>Search</button>
          <button onClick={getAllDishes}>Show All</button>
        </div>
      </div>

      <div id={styles.bottomContainer}>
        {showList.map((val) => {
          return (
            <Collapsible title={val.dish_name} category={val.dish_category}>
              <div className={styles.ingredients}>
                <p className={styles.heading}>Ingredients:</p>
                <p className={styles.ingredientsText}>{val.dish_ingredients}</p>
              </div>
              <div className={styles.steps}>
                <p className={styles.heading}>Steps:</p>
                <p className={styles.stepsText}>{val.dish_steps}</p>
              </div>
              <div className={styles.buttons}>
                <Link
                  to={{
                    pathname: "/Update",
                    state: {
                      id: val.id,
                      name: val.dish_name,
                      category: val.dish_category,
                      ingredients: val.dish_ingredients,
                      steps: val.dish_steps,
                    },
                  }}
                >
                  <button id={styles.updateBtn}>Update</button>
                </Link>
                <button
                  id={styles.deleteBtn}
                  onClick={() => deleteDish(val.id)}
                >
                  Delete
                </button>
              </div>
            </Collapsible>
          );
        })}
      </div>
    </div>
  );
}

export default App;
