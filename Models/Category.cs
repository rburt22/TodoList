using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization; // Add this import

namespace TodoList.Models
{
    public class Category
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        [StringLength(50)]
        public string Name { get; set; }
        
        public string Color { get; set; }
        
        [JsonIgnore] // Add this attribute to break the circular reference
        public List<TodoItem> TodoItems { get; set; }
    }
}