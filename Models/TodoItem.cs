using System;
using System.ComponentModel.DataAnnotations;

namespace TodoList.Models
{
    public class TodoItem
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        [StringLength(100)]
        public string Title { get; set; }
        
        public string Description { get; set; }
        
        [Required]
        public bool IsComplete { get; set; }
        
        [Required]
        public DateTime CreatedDate { get; set; }
        
        public DateTime? DueDate { get; set; }
        
        [Required]
        public Priority Priority { get; set; }
        
        [Required]
        public int CategoryId { get; set; }
        public Category Category { get; set; }
    }
    
    public enum Priority
    {
        Low,
        Medium,
        High,
        Urgent
    }
}
