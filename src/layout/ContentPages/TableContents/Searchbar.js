function Searchbar() {
    return (
        <div className="search-bar d-flex align-items-center">
        <button className="btn btn-primary">
        <i className="bi bi-funnel"></i>
        </button>
        <input
          type="text"
          className="form-control ms-2"
          placeholder="Search..."
          style={{ width: "200px" }}
        />
      </div>
    )
}

export default Searchbar
