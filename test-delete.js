// test-delete.js
const id = '1771425842464';
fetch(`http://localhost:3000/api/admin/content/${id}`, {method: 'DELETE'})
  .then(r => r.json())
  .then(d => {
    console.log('DELETE response:', d);
    if(d.success){
      console.log('✓ Deletion succeeded');
      // Verify by GET
      return fetch('http://localhost:3000/api/admin/content');
    }
  })
  .then(r => r?.json())
  .then(d => {
    if(d) {
      const found = d.contents.find(c => c.id === id);
      if(!found) {
        console.log('✓ Content confirmed deleted from list (total:', d.total, ')');
      } else {
        console.log('✗ Content still in list after DELETE');
      }
    }
  })
  .catch(e => console.log('Error:', e.message));
